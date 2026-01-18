"use client"

import { useState, useEffect } from "react"
import { PDFDocument, degrees } from "pdf-lib"
import { Document, Page, pdfjs } from "react-pdf"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, RefreshCw, Undo2, Redo2, CheckCircle, RotateCw, FileText } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { motion, AnimatePresence } from "framer-motion"
import "react-pdf/dist/Page/TextLayer.css"

// Initialize worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function RotateClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [rotations, setRotations] = useState<Record<number, number>>({}) // Index -> Degree (0, 90, 180, 270)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      // Initialize rotations to 0
      const initial: Record<number, number> = {}
      for (let i = 0; i < numPages; i++) initial[i] = 0
      setRotations(initial)
  }

  const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
      setRotations(prev => {
          const current = prev[index] || 0
          let newRot = direction === 'cw' ? current + 90 : current - 90
          // Normalize to 0-360
          newRot = (newRot % 360 + 360) % 360
          return { ...prev, [index]: newRot }
      })
  }

  const rotateAll = (direction: 'cw' | 'ccw') => {
      setRotations(prev => {
          const next = { ...prev }
          for (let i = 0; i < numPages; i++) {
              let current = next[i] || 0
              let newRot = direction === 'cw' ? current + 90 : current - 90
              next[i] = (newRot % 360 + 360) % 360
          }
          return next
      })
  }

  const handleProcess = async () => {
      if (!file) return
      setIsProcessing(true)
      
      try {
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const pages = pdfDoc.getPages()
          
          pages.forEach((page, idx) => {
              const rot = rotations[idx] || 0
              if (rot !== 0) {
                  const currentRot = page.getRotation().angle
                  page.setRotation(degrees(currentRot + rot))
              }
          })
          
          const pdfBytes = await pdfDoc.save()
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          
          setResult({
              downloadUrl: url,
              filename: `rotated-${file.name}`
          })

      } catch (err) {
          console.error(err)
          alert("Failed to rotate PDF.")
      } finally {
          setIsProcessing(false)
      }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-indigo-500/30 font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[30%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
             <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      <RefreshCw className="w-4 h-4" />
                      <span>Rotation Studio</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                      Fix <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Orientation</span>
                  </h1>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                      Rotate individual pages or the entire document permanently.
                  </p>
             </div>

             {!file ? (
                 <div className="max-w-2xl mx-auto w-full">
                     <Card className="bg-[#1E293B]/50 border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                         <FileUploader onFileSelect={(f) => setFile(f[0])} accept=".pdf" />
                     </Card>
                 </div>
             ) : !result ? (
                 <div className="flex-1 flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700">
                      {/* Controls Bar */}
                      <div className="sticky top-24 z-40 bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
                           <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                   <FileText />
                               </div>
                               <div className="hidden sm:block">
                                   <div className="font-bold text-white truncate max-w-[200px]">{file.name}</div>
                                   <div className="text-xs text-slate-400">{numPages} Pages</div>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl">
                               <Button variant="ghost" onClick={() => rotateAll('ccw')} className="text-slate-400 hover:text-white hover:bg-white/5 gap-2" title="Rotate All Left">
                                   <Undo2 size={18} /> <span className="hidden sm:inline">All Left</span>
                               </Button>
                               <div className="w-px h-6 bg-white/10"></div>
                               <Button variant="ghost" onClick={() => rotateAll('cw')} className="text-slate-400 hover:text-white hover:bg-white/5 gap-2" title="Rotate All Right">
                                   <Redo2 size={18} /> <span className="hidden sm:inline">All Right</span>
                               </Button>
                           </div>

                           <Button 
                                onClick={handleProcess} 
                                disabled={isProcessing}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-indigo-500/20"
                           >
                               {isProcessing ? <Loader2 className="animate-spin" /> : "Save Rotation"}
                           </Button>
                      </div>

                      {/* Grid View */}
                      <div className="bg-[#1E293B]/40 border border-white/5 rounded-[2.5rem] p-8 min-h-[500px]">
                           <Document 
                                file={file} 
                                onLoadSuccess={onDocumentLoadSuccess}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-center"
                            >
                                {Array.from({length: numPages}, (_, index) => {
                                    const rot = rotations[index] || 0
                                    return (
                                        <div key={index} className="flex flex-col gap-3 group">
                                            <div className="relative aspect-[3/4] bg-black/40 rounded-xl overflow-hidden border border-white/5 group-hover:border-indigo-500/50 transition-colors shadow-lg">
                                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-900">
                                                    <motion.div
                                                        animate={{ rotate: rot }}
                                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                                        className="origin-center"
                                                    >
                                                        <Page 
                                                            pageNumber={index + 1} 
                                                            width={200}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                            className="shadow-xl block max-w-full h-auto"
                                                        />
                                                    </motion.div>
                                                </div>
                                                
                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <Button variant="secondary" size="icon" onClick={() => rotatePage(index, 'ccw')} className="rounded-full h-10 w-10 bg-white/10 hover:bg-white text-white hover:text-black">
                                                        <Undo2 size={18} />
                                                    </Button>
                                                    <Button variant="secondary" size="icon" onClick={() => rotatePage(index, 'cw')} className="rounded-full h-10 w-10 bg-white/10 hover:bg-white text-white hover:text-black">
                                                        <Redo2 size={18} />
                                                    </Button>
                                                </div>
                                                
                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">
                                                    {rot}°
                                                </div>
                                            </div>
                                            <div className="text-center text-xs font-bold text-slate-500">Page {index + 1}</div>
                                        </div>
                                    )
                                })}
                           </Document>
                      </div>
                 </div>
             ) : (
                 <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500 max-w-xl mx-auto bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
                      <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                          <CheckCircle className="w-12 h-12 text-indigo-400" strokeWidth={3} />
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-white mb-2">Rotated!</h3>
                          <p className="text-slate-400">Orientation updated successfully.</p>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                          <a href={result.downloadUrl} download={result.filename} className="w-full">
                              <Button className="w-full h-14 bg-white text-indigo-950 font-black text-lg hover:bg-indigo-50 rounded-xl shadow-xl">
                                  <Download className="mr-2" strokeWidth={3} /> Download PDF
                              </Button>
                          </a>
                          <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}} className="text-slate-400 hover:text-white">
                              Rotate Another
                          </Button>
                      </div>
                 </div>
             )}
        </div>
    </div>
  )
}
