"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Image as ImageIcon, FileImage, Settings2, Check, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { motion, AnimatePresence } from "framer-motion"

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  
  // Settings
  const [quality, setQuality] = useState("2") // Scale factor: 1, 2, 3
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg")
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])
  
  const convertPageToBlob = async (pageNumber: number): Promise<{ blob: Blob | null, fileName: string }> => {
      if (!file) return { blob: null, fileName: "" }
      
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument(buffer).promise
      const page = await pdf.getPage(pageNumber)
      
      // Calculate viewport based on quality setting
      const scale = parseInt(quality)
      const viewport = page.getViewport({ scale })
      
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      const context = canvas.getContext("2d")
      if (!context) return { blob: null, fileName: "" }
      
      await page.render({ canvasContext: context, viewport } as any).promise
      
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, 0.9))
      
      const ext = format === 'png' ? 'png' : 'jpg'
      const fileName = `${file.name.replace(".pdf", "")}-page-${pageNumber}.${ext}`
      
      return { blob, fileName }
  }

  const handleDownloadSingle = async (pageNumber: number) => {
      try {
          const { blob, fileName } = await convertPageToBlob(pageNumber)
          if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = fileName
              a.click()
              URL.revokeObjectURL(url)
          }
      } catch (e) {
          console.error(e)
          alert("Failed to convert page")
      }
  }

  const handleDownloadAll = async () => {
      setIsProcessing(true)
      setProcessedCount(0)
      
      // Sequential download to avoid browser blocking
      for (let i = 1; i <= numPages; i++) {
          await handleDownloadSingle(i)
          setProcessedCount(i)
          // Small delay to prevent browser throttling
          await new Promise(r => setTimeout(r, 500))
      }
      
      setIsProcessing(false)
      setProcessedCount(0)
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-yellow-500/30 font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto py-32 px-6">
            <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                     <ImageIcon className="w-4 h-4" />
                     <span>PDF to Image Converter</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white">Convert PDF to <span className="text-yellow-500">HD Images</span></h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                     Extract high-resolution JPG or PNG images from your PDF pages. Secure client-side processing.
                 </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto p-12 rounded-[3.5rem] relative overflow-hidden group bg-[#0A0A0F]/60 border border-white/5 backdrop-blur-xl shadow-2xl hover:border-yellow-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Control Bar */}
                    <div className="sticky top-24 z-40 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between shadow-2xl gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 ring-1 ring-yellow-500/30">
                                <FileImage size={24} />
                            </div>
                            <div className="hidden sm:block">
                                <div className="font-bold text-white truncate max-w-[200px]">{file.name}</div>
                                <div className="text-sm text-gray-400">{numPages} Pages Detected</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                             <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">Format</span>
                                <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                    <SelectTrigger className="w-[100px] h-9 bg-transparent border-0 focus:ring-0 text-white font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jpeg">JPG</SelectItem>
                                        <SelectItem value="png">PNG</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">Quality</span>
                                <Select value={quality} onValueChange={setQuality}>
                                    <SelectTrigger className="w-[120px] h-9 bg-transparent border-0 focus:ring-0 text-white font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Standard (1x)</SelectItem>
                                        <SelectItem value="2">High (2x)</SelectItem>
                                        <SelectItem value="3">Ultra (3x)</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                             <Button 
                                onClick={handleDownloadAll}
                                disabled={isProcessing}
                                className="h-11 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                             >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {processedCount} / {numPages}
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" /> Download All
                                    </>
                                )}
                             </Button>

                             <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => setFile(null)}>
                                 <RefreshCcw size={18} />
                             </Button>
                        </div>
                    </div>
                    
                    {/* Grid */}
                    <div className="bg-[#0A0A0F]/60 border border-white/5 backdrop-blur-md p-8 rounded-[2rem]">
                        <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="flex justify-center">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {Array.from(new Array(numPages), (_, index) => (
                                    <motion.div 
                                        key={index} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group space-y-4"
                                    >
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#1A1A23] shadow-lg group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all duration-300">
                                            <Page 
                                                pageNumber={index + 1} 
                                                width={400} 
                                                renderTextLayer={false} 
                                                renderAnnotationLayer={false}
                                                className="mix-blend-normal opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                <Button onClick={() => handleDownloadSingle(index + 1)} className="bg-white text-black hover:bg-yellow-400 font-bold scale-90 group-hover:scale-100 transition-transform">
                                                    <Download className="mr-2 w-4 h-4" /> Save Page
                                                </Button>
                                            </div>
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                                                Page {index + 1}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Document>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}
