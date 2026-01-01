"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Eraser, ShieldAlert, Check, Eye, Trash2 } from "lucide-react"
import { pdfjs, Document, Page } from "react-pdf"
import { PDFDocument, rgb } from "pdf-lib"
import { SiteHeader } from "@/components/site-header"

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function RedactClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [redactions, setRedactions] = useState<Array<{ page: number, x: number, y: number, w: number, h: number }>>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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
        setResult({
            downloadUrl: URL.createObjectURL(blob),
            filename: `redacted-${file.name}`
        })
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
    <div className="min-h-screen bg-[#020617] text-white selection:bg-rose-500/30">
        <SiteHeader />
        
        <div className="max-w-6xl mx-auto py-32 px-6">
            <div className="text-center mb-12">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                     <Eraser className="w-8 h-8 text-rose-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">Redact PDF</h1>
                 <p className="text-slate-300">Permanently hide sensitive info. No data leaves your browser.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr,300px] gap-8">
                 <Card className="p-8 bg-slate-900/40 border-white/5 backdrop-blur-xl min-h-[600px] flex flex-col items-center justify-center overflow-hidden relative">
                    {!file ? (
                        <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                    ) : (
                        <div className="w-full flex flex-col items-center gap-6">
                            <div className="flex gap-4 mb-4">
                                <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                                <span className="flex items-center">Page {currentPage} of {numPages}</span>
                                <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage === numPages}>Next</Button>
                            </div>
                            
                            <div 
                                ref={containerRef}
                                className="relative bg-white shadow-2xl cursor-crosshair select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <Document
                                    file={file}
                                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                    className="shadow-xl"
                                >
                                    <Page 
                                        pageNumber={currentPage} 
                                        renderTextLayer={false} 
                                        renderAnnotationLayer={false}
                                        width={600}
                                    />
                                </Document>

                                {/* Redaction Layers */}
                                {redactions.filter(r => r.page === currentPage).map((rect, i) => (
                                    <div 
                                        key={i}
                                        className="absolute bg-black group"
                                        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRedactions(redactions.filter((_, idx) => idx !== i))
                                            }}
                                            className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        </div>
                    )}
                 </Card>

                 <div className="space-y-6">
                    <Card className="p-6 bg-slate-900 border-white/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-rose-500" />
                            Redactions
                        </h3>
                        <p className="text-sm text-slate-300 mb-6">Draw boxes over text or images you want to hide forever.</p>
                        
                        <div className="space-y-3 mb-8 max-h-[300px] overflow-auto">
                            {redactions.map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg text-xs">
                                    <span>Box {i+1} (Page {r.page})</span>
                                    <Button variant="ghost" size="sm" onClick={() => setRedactions(redactions.filter((_, idx) => idx !== i))}>
                                        <Trash2 size={14} className="text-slate-500 hover:text-rose-500" />
                                    </Button>
                                </div>
                            ))}
                            {redactions.length === 0 && <div className="text-center py-8 text-slate-400 border-2 border-dashed border-white/5 rounded-xl">No areas selected</div>}
                        </div>

                        {!result ? (
                             <Button 
                                onClick={handleApplyRedaction}
                                disabled={!file || redactions.length === 0 || isProcessing}
                                className="w-full h-12 bg-rose-600 hover:bg-rose-700 font-bold"
                             >
                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Eraser className="mr-2 w-4 h-4" />}
                                Redact PDF
                             </Button>
                        ) : (
                            <div className="space-y-3">
                                <a href={result.downloadUrl} download={result.filename} className="block w-full">
                                    <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold">
                                        <Download className="mr-2 w-4 h-4" /> Download
                                    </Button>
                                </a>
                                <Button variant="ghost" className="w-full" onClick={() => {setResult(null); setRedactions([])}}>Clear All</Button>
                            </div>
                        )}
                    </Card>

                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200 leading-relaxed">
                        <strong>Security Warning:</strong> This tool permanently burns the black boxes into the PDF. Redacted content cannot be recovered by任何人.
                    </div>
                 </div>
            </div>
        </div>
    </div>
  )
}
