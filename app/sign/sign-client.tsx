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

export default function SignClient() {
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

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

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
      const sigWidth = 150
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth
      currentPage.drawImage(sigImage, {
        x: (sigPosition.x / 100) * width - (sigWidth / 2),
        y: (1 - sigPosition.y / 100) * height - (sigHeight / 2),
        width: sigWidth,
        height: sigHeight,
      })
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
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
      <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
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
                        {signature && (
                            <motion.div 
                                drag
                                dragMomentum={false}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-move z-50 group"
                                style={{ width: 150 }}
                            >
                                <div className="p-2 border-2 border-dashed border-amber-500/50 group-hover:border-amber-500 rounded bg-white/10 backdrop-blur-sm">
                                    <img src={signature} alt="Sign" className="w-full mix-blend-multiply brightness-0" />
                                    <div className="absolute -top-6 left-0 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Drag to place</div>
                                </div>
                            </motion.div>
                        )}
                        <div 
                            className="absolute inset-0 cursor-crosshair"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const x = ((e.clientX - rect.left) / rect.width) * 100
                                const y = ((e.clientY - rect.top) / rect.height) * 100
                                setSigPosition({ x, y })
                            }}
                        />
                        {signature && (
                            <div 
                                className="absolute w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] pointer-events-none animate-pulse"
                                style={{ left: `${sigPosition.x}%`, top: `${sigPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="absolute inset-0 rounded-full border border-white animate-ping"></div>
                            </div>
                        )}
                    </div>
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
                            onClick={() => { setFile(null); setSignature(null); }}
                            className="w-full text-slate-500 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            </div>
        ) : (
             <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                      <Download className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Ready to Download</h2>
                  <p className="text-slate-400 mb-12">Your signed document is ready. It has been processed securely in your browser.</p>
                  <div className="flex gap-4">
                      <a href={resultUrl} download="signed-document.pdf" className="flex-1">
                          <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg">
                              Download PDF
                          </Button>
                      </a>
                      <Button variant="outline" onClick={() => setResultUrl(null)} className="flex-1 border-white/10 bg-white/5 text-white">
                          Sign Another
                      </Button>
                  </div>
             </div>
        )}
      </div>

      <AnimatePresence>
        {isSignModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsSignModalOpen(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Draw Signature</h2>
                        <button onClick={clearSignature} className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">Clear Canvas</button>
                    </div>
                    <div className="p-8 bg-white m-4 rounded-2xl h-64">
                         <SignatureCanvas 
                            ref={(ref) => { sigCanvas.current = ref }}
                            penColor="black"
                            canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                         />
                    </div>
                    <div className="p-8 flex gap-4">
                        <Button 
                            variant="ghost" 
                            className="flex-1 text-slate-400"
                            onClick={() => setIsSignModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 bg-white text-slate-950 hover:bg-amber-400 font-bold"
                            onClick={saveSignature}
                        >
                            Save Signature
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}
