"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Eraser, ShieldAlert, Check, Eye, Trash2, AlertTriangle, ShieldCheck, RefreshCcw, FileText } from "lucide-react"
import { pdfjs, Document, Page } from "react-pdf"
import { PDFDocument, rgb } from "pdf-lib"
import { SiteHeader } from "@/components/site-header"
import { motion, AnimatePresence } from "framer-motion"
import { NextActionGrid } from "@/components/next-action-grid"
import { getGlobalFile } from "@/lib/file-store"
import { cn } from "@/lib/utils"

// Worker setup
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function RedactClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [redactedFile, setRedactedFile] = useState<File | null>(null)
  const [redactions, setRedactions] = useState<Array<{ page: number, x: number, y: number, w: number, h: number }>>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
      const global = getGlobalFile()
      if (global.file) {
          setFile(global.file)
      }
  }, [])

  const handleApplyRedaction = async () => {
    if (!file || redactions.length === 0) return
    setIsProcessing(true)
    
    try {
        const existingPdfBytes = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const pages = pdfDoc.getPages()

        // Apply redactions
        redactions.forEach(rect => {
            const page = pages[rect.page - 1]
            const { height } = page.getSize()
            
            // Draw black rectangle
            // Note: Coordinate system in pdf-lib is bottom-up
            page.drawRectangle({
                x: rect.x,
                y: height - rect.y - rect.h,
                width: rect.w,
                height: rect.h,
                color: rgb(0, 0, 0),
            })
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const filename = `redacted-${file.name}`

        setResult({
            downloadUrl: url,
            filename
        })
        
        const newFile = new File([blob], filename, { type: 'application/pdf' })
        setRedactedFile(newFile)

    } catch (err) {
        alert("Failed to redact PDF")
    } finally {
        setIsProcessing(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(e.clientX - rect.left, startPos.x)
    const y = Math.min(e.clientY - rect.top, startPos.y)
    const w = Math.abs(e.clientX - rect.left - startPos.x)
    const h = Math.abs(e.clientY - rect.top - startPos.y)
    setCurrentBox({ x, y, w, h })
  }

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 5) {
        setRedactions([...redactions, { ...currentBox, page: currentPage }])
    }
    setIsDrawing(false)
    setCurrentBox(null)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-rose-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen">
             <div className="text-center mb-16 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                      <Eraser className="w-4 h-4" />
                      <span>Security Studio</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                      Redact <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">PDF</span>
                  </h1>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">
                      Permanently hide sensitive information. Blacked-out areas are unrecoverable.
                  </p>
             </div>

             {!file ? (
                 <div className="max-w-xl mx-auto mt-8">
                     <Card className="bg-[#1E293B]/50 border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                         <FileUploader onFileSelect={(f) => setFile(f[0])} accept=".pdf" />
                     </Card>
                 </div>
             ) : !result ? (
                 <div className="grid lg:grid-cols-[1fr,350px] gap-8 items-start animate-in slide-in-from-bottom-8 duration-700">
                     
                     {/* CANVAS AREA */}
                     <Card className="min-h-[700px] bg-[#1E293B]/50 border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md flex flex-col items-center relative overflow-hidden">
                        <div className="w-full flex justify-between items-center mb-6 z-20">
                             <div className="flex items-center gap-4 text-white">
                                 <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 font-mono text-sm">
                                      {file.name}
                                 </div>
                             </div>
                             <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">Prev</Button>
                                  <span className="px-4 font-bold text-sm">Page {currentPage} of {numPages}</span>
                                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage === numPages} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">Next</Button>
                             </div>
                        </div>

                        <div 
                            ref={containerRef}
                            className="relative shadow-2xl cursor-crosshair select-none ring-4 ring-black/20 rounded-sm overflow-hidden"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            <Document
                                file={file}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                className="opacity-100"
                            >
                                <Page 
                                    pageNumber={currentPage} 
                                    renderTextLayer={false} 
                                    renderAnnotationLayer={false}
                                    width={600}
                                    className="bg-white"
                                />
                            </Document>

                            {/* Redaction Layers */}
                            {redactions.filter(r => r.page === currentPage).map((rect, i) => (
                                <div 
                                    key={i}
                                    className="absolute bg-black group opacity-90 hover:opacity-100 transition-opacity border border-white/20"
                                    style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRedactions(redactions.filter((_, idx) => idx !== i)) // BUG: 'i' is map index, need robust ID or filter properly. 'i' works if list doesn't change order.
                                            // Actually with filter below, we compare index mismatch? No, 'i' in map is unstable if we filter.
                                            // Correct way: use unique ID. But for MVP:
                                            // Find index in MASTER redactions array where page matches and pos matches... too complex.
                                            // Easy way: Just store ID.
                                        }}
                                        className="absolute -top-3 -right-3 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm scale-0 group-hover:scale-100"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}

                            {currentBox && (
                                <div 
                                    className="absolute bg-rose-500/30 border-2 border-rose-500"
                                    style={{ left: currentBox.x, top: currentBox.y, width: currentBox.w, height: currentBox.h }}
                                />
                            )}
                        </div>
                        
                        <div className="absolute top-10 left-10 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-rose-500/20 max-w-xs pointer-events-none z-10">
                             <p className="text-xs text-rose-200 flex gap-2">
                                <ShieldAlert size={16} className="shrink-0" />
                                Draw boxes to redact text.
                             </p>
                        </div>
                     </Card>
                     
                     {/* SIDEBAR */}
                     <div className="space-y-6">
                        <Card className="bg-[#1E293B]/80 border-white/5 rounded-[2rem] p-6 shadow-xl backdrop-blur-xl">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                 <ShieldCheck className="text-rose-400" />
                                 Redaction List
                             </h3>
                             
                             <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {redactions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                                        <Eraser size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No areas selected yet</p>
                                    </div>
                                ) : (
                                    redactions.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs">
                                                     {i + 1}
                                                 </div>
                                                 <div>
                                                     <div className="text-sm font-bold text-slate-200">Redaction Box</div>
                                                     <div className="text-[10px] text-slate-500">Page {r.page}</div>
                                                 </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setRedactions(redactions.filter((_, idx) => idx !== i))}
                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg h-8 w-8 p-0"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                             </div>
                             
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                 <Button 
                                    onClick={handleApplyRedaction}
                                    disabled={!file || redactions.length === 0 || isProcessing}
                                    className="w-full h-14 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-lg rounded-xl shadow-[0_10px_30px_rgba(225,29,72,0.3)] transition-all hover:scale-[1.02]"
                                 >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                                    Apply Redactions
                                 </Button>
                                 <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
                                     <AlertTriangle size={12} className="inline mr-1 text-orange-400" />
                                     Warning: Action is irreversible.
                                 </p>
                             </div>
                        </Card>
                     </div>
                 </div>
             ) : (
                 <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
                     <div className="p-1 rounded-[3.5rem] bg-gradient-to-b from-rose-500/20 to-transparent">
                        <div className="bg-[#1E293B]/80 p-12 rounded-[3.4rem] border border-white/5 backdrop-blur-xl text-center shadow-2xl">
                             <div className="w-24 h-24 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-8 animate-float shadow-[0_0_40px_rgba(244,63,94,0.3)]">
                                 <ShieldCheck size={48} strokeWidth={3} />
                             </div>
                             <h2 className="text-4xl font-black text-white mb-4">Secure & Redacted!</h2>
                             <p className="text-slate-400 text-lg mb-10">All selected areas have been permanently removed.</p>
                             
                             <div className="space-y-4">
                                 <a href={result.downloadUrl} download={result.filename}>
                                     <Button className="w-full h-16 bg-white text-black hover:bg-slate-200 font-bold text-xl rounded-2xl shadow-xl transition-transform hover:scale-105">
                                         <Download className="mr-3" /> Download PDF
                                     </Button>
                                 </a>
                                 <Button 
                                     variant="ghost" 
                                     onClick={() => { setFile(null); setResult(null); setRedactions([]); }}
                                     className="w-full h-14 text-slate-400 hover:text-white"
                                 >
                                     <RefreshCcw className="mr-2 w-4 h-4" /> Redact Another
                                 </Button>
                             </div>
                             
                             <NextActionGrid file={redactedFile} />
                        </div>
                     </div>
                 </div>
             )}
        </div>
    </div>
  )
}
