"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, FileType, Image as ImageIcon, FileText, ArrowRight, RefreshCw, CheckCircle, Zap } from "lucide-react"
import { pdfjs } from "react-pdf"
import { SiteHeader } from "@/components/site-header"
import "react-pdf/dist/Page/TextLayer.css"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ConvertFormat = "pdf" | "docx" | "png" | "jpg" | "webp" | "tiff" | "avif" | "gif" | "bmp"

export default function ConvertPage() {
  const [files, setFiles] = useState<File[]>([])
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>("pdf")
  const [isConverting, setIsConverting] = useState(false)
  const [result, setResult] = useState<{ downloadUrl?: string; filename: string; blob?: Blob } | null>(null)
  const [error, setError] = useState("")

  const handleConvert = async () => {
    if (files.length === 0) return
    setIsConverting(true)
    setError("")
    setResult(null)

    const inputFile = files[0]
    const inputType = inputFile.type

    try {
      // client-side PDF -> Image conversion
      if (inputType === "application/pdf" && ["png", "jpg", "webp", "tiff", "avif", "gif"].includes(targetFormat)) {
          await convertPdfToImage(inputFile, targetFormat)
          return
      }

      // Server-side conversions
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))
      formData.append("convertType", targetFormat)

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setIsConverting(false)
    }
  }

  const convertPdfToImage = async (file: File, format: string) => {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument(arrayBuffer).promise
        const page = await pdf.getPage(1) // Convert first page by default
        
        const viewport = page.getViewport({ scale: 2.0 }) // High resolution
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        
        if (!context) throw new Error("Canvas context not found")
            
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        const renderContext: any = {
            canvasContext: context,
            viewport: viewport
        }

        await page.render(renderContext).promise

        const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`
        
        canvas.toBlob((blob) => {
            if (!blob) {
                setError("Failed to generate image")
                setIsConverting(false)
                return
            }
            
            const url = URL.createObjectURL(blob)
            setResult({
                downloadUrl: url,
                filename: `converted-page-1.${format}`,
                blob: blob
            })
            setIsConverting(false)
        }, mimeType)

    } catch (err) {
        console.error(err)
        setError("Failed to convert PDF to image")
        setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
        <SiteHeader />
        
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        </div>

      <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                 <RefreshCw className="w-8 h-8 text-cyan-500" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                 File Converter
             </h1>
             <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                 Change your files quickly between PDF, Images, and Word formats.
             </p>
        </div>

        {/* Quick Actions Grid */}
        {files.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { icon: FileText, label: "Document to PDF", sub: "DOCX, TXT to PDF", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", format: "pdf" },
                    { icon: FileType, label: "PDF to Word", sub: "PDF to DOCX", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", format: "docx" },
                    { icon: ImageIcon, label: "PDF to Image", sub: "PDF to JPG/PNG", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", format: "jpg" },
                    { icon: RefreshCw, label: "Image Format", sub: "Convert Images", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", format: "png" },
                ].map((item) => (
                    <button 
                        key={item.label}
                        onClick={() => { setTargetFormat(item.format as any); (document.querySelector('input[type="file"]') as HTMLInputElement)?.click() }}
                        className="p-6 bg-slate-900/50 border border-white/5 hover:border-white/20 rounded-2xl text-left transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/5 relative overflow-hidden"
                    >
                        <div className={`p-3 w-fit rounded-xl mb-4 ${item.bg} ${item.border} border group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`${item.color} w-6 h-6`} />
                        </div>
                        <div className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{item.label}</div>
                        <div className="text-xs text-slate-500 font-medium">{item.sub}</div>
                    </button>
                ))}
            </div>
        )}

        <Card className="p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {!result ? (
            <div className="grid lg:grid-cols-2 gap-12 relative z-10">
               {/* Left: Input */}
               <div className="space-y-6">
                 <div>
                   <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">1</span> Source File
                   </h2>
                   <FileUploader
                    onFileSelect={setFiles}
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt,.tiff,.avif,.gif,.bmp,.svg,.md,.html"
                   />
                 </div>
                 
                 {files.length > 0 && (
                   <div className="p-4 bg-slate-800/50 border border-white/10 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                     <div className="p-2 bg-slate-700/50 rounded-lg">
                        <FileText className="text-cyan-400 w-5 h-5" />
                     </div>
                     <span className="font-medium text-slate-200 truncate flex-1">{files[0].name}</span>
                     <button onClick={() => setFiles([])} className="text-slate-500 hover:text-white transition-colors">Change</button>
                   </div>
                 )}
               </div>

               {/* Right: Settings */}
               <div className={`space-y-6 transition-all duration-500 ${files.length === 0 ? "opacity-50 blur-sm pointer-events-none" : "opacity-100"}`}>
                 <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">2</span> Convert To
                    </h2>
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3"> 
                    {(["pdf", "docx", "png", "jpg", "webp", "tiff", "avif", "gif"] as const).map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => setTargetFormat(fmt)}
                            className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                targetFormat === fmt 
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                                : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <span className="uppercase font-bold text-xs">{fmt}</span>
                        </button>
                    ))}
                 </div>

                 {/* Logic Check / Warning */}
                 {files.length > 0 && files[0].type === "application/pdf" && !["pdf", "docx"].includes(targetFormat) && (
                     <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg text-xs flex items-center gap-2">
                         <Zap className="w-3 h-3" />
                         Note: Converting PDF to image will convert the <strong>first page only</strong>.
                     </div>
                 )}

                 {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

                 <Button 
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                    className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    {isConverting ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" /> Converting...
                        </>
                    ) : (
                        <>Start Conversion <ArrowRight className="ml-2 w-5 h-5" /></>
                    )}
                 </Button>
               </div>
            </div>
          ) : (
              <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold mb-2">Conversion Complete!</h2>
                      <p className="text-slate-400">Your file has been successfully converted to <span className="text-white font-bold">{targetFormat.toUpperCase()}</span></p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                      <a href={result.downloadUrl} download={result.filename} className="flex-1">
                          <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg">
                              <Download className="mr-2" /> Download File
                          </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        onClick={() => { setResult(null); setFiles([]); }}
                        className="flex-1 h-14 text-slate-400 hover:text-white hover:bg-white/5"
                      >
                          Convert Another
                      </Button>
                  </div>
              </div>
          )}
        </Card>
      </div>
    </div>
  )
}
