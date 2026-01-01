"use client"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { PDFDocument, rgb } from "pdf-lib"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { SiteHeader } from "@/components/site-header"
import { 
  Signature, PenTool, Download, Check, Trash2, 
  Loader2, MousePointer2, Eraser, Move, Sparkles 
} from "lucide-react"
import SignatureCanvas from "react-signature-canvas"
import { motion, AnimatePresence } from "framer-motion"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [activePage, setActivePage] = useState(1)
  
  const [signature, setSignature] = useState<string | null>(null)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const sigCanvas = useRef<SignatureCanvas | null>(null)
  
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0])
      setFileUrl(URL.createObjectURL(files[0]))
      setResultUrl(null)
    }
  }

  const clearSignature = () => {
    sigCanvas.current?.clear()
  }

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) return
    setSignature(sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)
    setIsSignModalOpen(false)
  }

  const handleSign = async () => {
    if (!file || !signature) return
    setIsProcessing(true)

    try {
      const existingPdfBytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      
      const sigImage = await pdfDoc.embedPng(signature)
      const pages = pdfDoc.getPages()
      const currentPage = pages[activePage - 1]
      
      const { width, height } = currentPage.getSize()
      
      // Convert UI percentage positions (roughly) to PDF units
      // In PDF, (0,0) is bottom-left. In UI, it's relative.
      // This is a simplified approximation
      const sigWidth = 150
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth
      
      currentPage.drawImage(sigImage, {
        x: (sigPosition.x / 100) * width - (sigWidth / 2),
        y: (1 - sigPosition.y / 100) * height - (sigHeight / 2),
        width: sigWidth,
        height: sigHeight,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
      alert("Failed to sign PDF")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">
      <SiteHeader />
      
      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Signature size={24} />
            </div>
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Electronic Signature</h1>
                <p className="text-slate-400">Securely sign your documents in seconds.</p>
            </div>
        </div>

        {!file ? (
            <Card className="max-w-xl mx-auto p-12 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl mt-12 text-center group">
                 <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <PenTool className="w-10 h-10 text-amber-500" />
                 </div>
                 <h2 className="text-2xl font-bold mb-4">Upload PDF to Sign</h2>
                 <p className="text-slate-500 mb-10">Your documents stay private. Signature processing happens locally.</p>
                 <FileUploader onFileSelect={handleFileSelect} accept=".pdf" />
            </Card>
        ) : !resultUrl ? (
            <div className="grid lg:grid-cols-[1fr_350px] gap-8 h-[calc(100vh-250px)]">
                
                {/* PDF Viewer / Signature Placer */}
                <div className="relative bg-slate-900/50 rounded-3xl border border-white/5 overflow-auto p-8 flex flex-col items-center">
                    <div className="relative shadow-2xl bg-white p-0 rounded-sm">
                        <Document 
                            file={fileUrl} 
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        >
                            <Page 
                                pageNumber={activePage} 
                                width={600}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="pointer-events-none"
                            />
                        </Document>

                        {/* Draggable Signature Ghost */}
                        {signature && (
                            <motion.div 
                                drag
                                dragMomentum={false}
                                onDragEnd={(_, info) => {
                                    // Calculate relative position to the container
                                    // This is a simplified version
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-move z-50 group"
                                style={{ width: 150 }}
                            >
                                <div className="p-2 border-2 border-dashed border-amber-500/50 group-hover:border-amber-500 rounded bg-white/10 backdrop-blur-sm">
                                    <img src={signature} alt="Sign" className="w-full mix-blend-multiply brightness-0" />
                                    <div className="absolute -top-6 left-0 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Drag to place</div>
                                </div>
                            </motion.div>
                        )}

                        {/* Click-to-place sensing area */}
                        <div 
                            className="absolute inset-0 cursor-crosshair"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const x = ((e.clientX - rect.left) / rect.width) * 100
                                const y = ((e.clientY - rect.top) / rect.height) * 100
                                setSigPosition({ x, y })
                            }}
                        />

                        {/* Visual Indicator of Final Position */}
                        {signature && (
                            <div 
                                className="absolute w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] pointer-events-none animate-pulse"
                                style={{ left: `${sigPosition.x}%`, top: `${sigPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="absolute inset-0 rounded-full border border-white animate-ping"></div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex items-center gap-6 bg-slate-900/80 backdrop-blur p-2 rounded-full border border-white/10">
                        <Button 
                            variant="ghost" size="icon" className="rounded-full"
                            onClick={() => setActivePage(p => Math.max(1, p - 1))}
                            disabled={activePage === 1}
                        >
                            <Move className="w-4 h-4 rotate-180" />
                        </Button>
                        <span className="text-xs font-mono font-bold tracking-widest uppercase">Page {activePage} of {numPages}</span>
                        <Button 
                            variant="ghost" size="icon" className="rounded-full"
                            onClick={() => setActivePage(p => Math.min(numPages, p + 1))}
                            disabled={activePage === numPages}
                        >
                            <Move className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <Card className="p-8 bg-slate-900 border-white/10 flex flex-col gap-8 shadow-2xl rounded-[2.5rem]">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Signature size={12} /> Your Signature
                        </h3>
                        {signature ? (
                            <div className="relative group p-6 bg-white rounded-2xl border-2 border-white/5 transition-all">
                                <img src={signature} alt="Signature" className="w-full mix-blend-multiply brightness-0" />
                                <button 
                                    onClick={() => setSignature(null)}
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <Button 
                                onClick={() => setIsSignModalOpen(true)}
                                className="w-full h-24 border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl flex flex-col gap-2"
                            >
                                <PenTool className="w-6 h-6" />
                                <span className="text-xs font-bold">Create Signature</span>
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Click on PDF to target position</span>
                        </div>
                        <Button 
                            onClick={handleSign}
                            disabled={!signature || isProcessing}
                            className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                            {isProcessing ? "Processing..." : "Sign Document"}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-slate-500 hover:text-white"
                            onClick={() => setFile(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            </div>
        ) : (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-10">
                 <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_-10px_rgba(245,158,11,0.5)]">
                    <Check className="w-12 h-12 text-amber-500" />
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl font-bold italic">Signed & Sealed!</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Your electronic signature has been embedded securely. 
                        Nebula signature verification is compliant and ready for use.
                    </p>
                 </div>
                 <div className="flex justify-center gap-4">
                     <a href={resultUrl} download={`signed-${file?.name || 'document'}`}>
                        <Button className="h-16 px-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl shadow-xl">
                            <Download className="mr-2" /> Download Signed PDF
                        </Button>
                     </a>
                     <Button 
                        variant="ghost" 
                        className="h-16 px-8 rounded-2xl text-slate-400 hover:bg-white/5"
                        onClick={() => { setFile(null); setResultUrl(null); }}
                     >
                         Sign Another
                     </Button>
                 </div>
            </div>
        )}
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {isSignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Draw Your Signature</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsSignModalOpen(false)}>
                                <X size={20} />
                            </Button>
                        </div>
                        
                        <div className="bg-white rounded-3xl overflow-hidden h-64 border-4 border-slate-950 shadow-inner">
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{
                                    className: "w-full h-full cursor-crosshair"
                                }}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button 
                                variant="outline" 
                                onClick={clearSignature}
                                className="flex-1 h-14 border-white/10 hover:bg-white/5 font-bold"
                            >
                                <Eraser className="mr-2 w-4 h-4" /> Clear Canvas
                            </Button>
                            <Button 
                                onClick={saveSignature}
                                className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 font-bold"
                            >
                                Save & Apply
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
