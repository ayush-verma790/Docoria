"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, FileType, Image as ImageIcon, FileText, ArrowRight, RefreshCw, CheckCircle, Zap, Table, Presentation } from "lucide-react"
import { pdfjs } from "react-pdf"
import { SiteHeader } from "@/components/site-header"
import "react-pdf/dist/Page/TextLayer.css"

type ConvertFormat = "pdf" | "docx" | "png" | "jpg" | "webp" | "tiff" | "avif" | "gif" | "bmp" | "xlsx" | "pptx"

export default function ConvertClient({ initialFormat = "pdf" }: { initialFormat?: ConvertFormat }) {
  const [files, setFiles] = useState<File[]>([])
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>(initialFormat)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isConverting, setIsConverting] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string; filename: string; blob: Blob } | null>(null)
  const [error, setError] = useState("")

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    // Configure PDF.js worker only on client
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

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
    <div 
        className="min-h-screen bg-[#030014] text-white font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-white"
        onMouseMove={handleMouseMove}
    >
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
            <div className="absolute bottom-[10%] right-[0%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 mb-4 shadow-[0_0_40px_rgba(99,102,241,0.2)] group hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                 <RefreshCw className="w-10 h-10 text-indigo-400 group-hover:rotate-180 transition-transform duration-700" />
             </div>
             <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-cyan-400">
                 File Converter
             </h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                 Professional conversion between PDF, Word, Excel, and Images with surgical precision.
             </p>
        </div>

        {/* Quick Actions Grid */}
        {files.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { icon: FileText, label: "Document to PDF", sub: "DOCX, TXT to PDF", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", format: "pdf" },
                    { icon: FileType, label: "PDF to Word", sub: "PDF to DOCX", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", format: "docx" },
                    { icon: ImageIcon, label: "PDF to Image", sub: "PDF to JPG/PNG", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", format: "jpg" },
                    { icon: RefreshCw, label: "Image Format", sub: "Convert Images", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", format: "png" },
                    { icon: Table, label: "PDF to Excel", sub: "PDF to XLSX", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", format: "xlsx" },
                    { icon: Presentation, label: "PDF to PPT", sub: "PDF to PPTX", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", format: "pptx" },
                ].map((item) => (
                    <button 
                        key={item.label}
                        onClick={() => { setTargetFormat(item.format as any); (document.querySelector('input[type="file"]') as HTMLInputElement)?.click() }}
                        className="p-6 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-2xl text-left transition-all group hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden backdrop-blur-sm"
                    >
                        <div className={`p-3 w-fit rounded-xl mb-4 ${item.bg} ${item.border} border group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`${item.color} w-6 h-6`} />
                        </div>
                        <div className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{item.label}</div>
                        <div className="text-xs text-gray-400 font-medium group-hover:text-gray-300">{item.sub}</div>
                    </button>
                ))}
            </div>
        )}

        <Card className="p-8 border-border bg-card shadow-lg relative overflow-hidden">
          {!result ? (
            <div className="grid lg:grid-cols-2 gap-12 relative z-10">
               {/* Left: Input */}
               <div className="space-y-6">
                 <div>
                   <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-foreground">1</span> Source File
                   </h2>
                   <FileUploader
                    onFileSelect={setFiles}
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt,.tiff,.avif,.gif,.bmp,.svg,.md,.html"
                   />
                 </div>
                 
                 {files.length > 0 && (
                   <div className="p-4 bg-muted/50 border border-border rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                     <div className="p-2 bg-background rounded-lg shadow-sm">
                        <FileText className="text-primary w-5 h-5" />
                     </div>
                     <span className="font-medium text-foreground truncate flex-1">{files[0].name}</span>
                     <button onClick={() => setFiles([])} className="text-muted-foreground hover:text-foreground transition-colors">Change</button>
                   </div>
                 )}
               </div>

               {/* Right: Settings */}
               <div className={`space-y-6 transition-all duration-500 ${files.length === 0 ? "opacity-50 blur-sm pointer-events-none" : "opacity-100"}`}>
                 <div>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-foreground">2</span> Convert To
                    </h2>
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3"> 
                    {(["pdf", "docx", "xlsx", "pptx", "png", "jpg", "webp", "tiff", "avif", "gif"] as const).map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => setTargetFormat(fmt)}
                            className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                targetFormat === fmt 
                                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <span className="uppercase font-bold text-xs">{fmt}</span>
                        </button>
                    ))}
                 </div>

                 {/* Logic Check / Warning */}
                 {files.length > 0 && files[0].type === "application/pdf" && !["pdf", "docx"].includes(targetFormat) && (
                     <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-2">
                         <Zap className="w-3 h-3" />
                         Note: Converting PDF to image will convert the <strong>first page only</strong>.
                     </div>
                 )}

                 {error && <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">{error}</div>}

                 <Button 
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-xl shadow-green-500/10">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold mb-2">Conversion Complete!</h2>
                      <p className="text-muted-foreground">Your file has been successfully converted to <span className="text-foreground font-bold">{targetFormat.toUpperCase()}</span></p>
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
                        className="flex-1 h-14 text-muted-foreground hover:text-foreground hover:bg-muted"
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
