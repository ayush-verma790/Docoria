"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { Slider } from "@/components/ui/slider"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Plus, GitCompare, Layers, Columns, Eye, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css' // Optional
import 'react-pdf/dist/Page/TextLayer.css'

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function CompareClient() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [mode, setMode] = useState<"side" | "overlay">("side")
  const [opacity, setOpacity] = useState([50])
  const [currentPage, setCurrentPage] = useState(1)
  const [numPagesA, setNumPagesA] = useState(0)
  const [numPagesB, setNumPagesB] = useState(0)

  // Handlers
  const handleNextPage = () => {
    const max = Math.max(numPagesA, numPagesB)
    if (currentPage < max) setCurrentPage(p => p + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1)
  }

  return (
    <div className="dark min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
        <SiteHeader />
        
        {/* Background Atmosphere */}
         <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-28 pb-10 px-6 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            
            {/* Header */}
            <div className="text-center mb-10 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold shadow-lg shadow-blue-500/10 mb-2">
                     <GitCompare size={16} /> Compare Studio
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                     Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Versions</span>
                 </h1>
                 <p className="text-slate-400 max-w-2xl mx-auto">Upload two PDF documents to spot differences instantly.</p>
            </div>

            {(!fileA || !fileB) ? (
                <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-8 items-start">
                    {/* Upload A */}
                    <Card className="p-8 bg-slate-900/50 border-white/5 rounded-3xl min-h-[400px] flex flex-col items-center justify-center relative overflown-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         {!fileA ? (
                             <div className="text-center w-full space-y-6 relative z-10">
                                 <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
                                     <span className="text-2xl font-black">A</span>
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold mb-2">Original Version</h3>
                                     <p className="text-sm text-slate-500 mb-6">Upload the first PDF document</p>
                                     <FileUploader onFileSelect={(files) => setFileA(files[0])} accept=".pdf" />
                                 </div>
                             </div>
                         ) : (
                             <div className="space-y-4 text-center w-full relative z-10">
                                 <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                    <Document file={fileA} className="opacity-80 scale-90">
                                        <Page pageNumber={1} width={200} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                 </div>
                                 <h3 className="font-bold truncate px-4">{fileA.name}</h3>
                                 <Button variant="ghost" onClick={() => setFileA(null)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><X size={16} className="mr-2" /> Remove</Button>
                             </div>
                         )}
                    </Card>

                    {/* Upload B */}
                    <Card className="p-8 bg-slate-900/50 border-white/5 rounded-3xl min-h-[400px] flex flex-col items-center justify-center relative overflown-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         {!fileB ? (
                             <div className="text-center w-full space-y-6 relative z-10">
                                 <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400 border border-cyan-500/20">
                                     <span className="text-2xl font-black">B</span>
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold mb-2">Modified Version</h3>
                                     <p className="text-sm text-slate-500 mb-6">Upload the second PDF document</p>
                                     <FileUploader onFileSelect={(files) => setFileB(files[0])} accept=".pdf" />
                                 </div>
                             </div>
                         ) : (
                             <div className="space-y-4 text-center w-full relative z-10">
                                 <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                    <Document file={fileB} className="opacity-80 scale-90">
                                        <Page pageNumber={1} width={200} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                 </div>
                                 <h3 className="font-bold truncate px-4">{fileB.name}</h3>
                                 <Button variant="ghost" onClick={() => setFileB(null)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><X size={16} className="mr-2" /> Remove</Button>
                             </div>
                         )}
                    </Card>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Controls Bar */}
                    <Card className="p-4 bg-slate-900/80 border-white/10 backdrop-blur-md rounded-2xl flex flex-wrap items-center justify-between gap-4 sticky top-24 z-30">
                         <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl">
                             <Button 
                                variant="ghost" 
                                onClick={() => setMode("side")}
                                className={cn("rounded-lg text-sm font-bold gap-2", mode === "side" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                             >
                                 <Columns size={16} /> Side by Side
                             </Button>
                             <Button 
                                variant="ghost" 
                                onClick={() => setMode("overlay")}
                                className={cn("rounded-lg text-sm font-bold gap-2", mode === "overlay" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                             >
                                 <Layers size={16} /> Overlay
                             </Button>
                         </div>

                         {mode === "overlay" && (
                             <div className="flex items-center gap-4 flex-1 max-w-sm px-4">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opacity</span>
                                 <Slider value={opacity} onValueChange={setOpacity} max={100} step={1} className="flex-1" />
                                 <span className="text-xs font-bold w-8 text-right text-blue-400">{opacity}%</span>
                             </div>
                         )}

                         <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                                 <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage <= 1} className="h-8 w-8 rounded-md"><ChevronLeft size={16} /></Button>
                                 <span className="text-sm font-mono w-24 text-center">Page {currentPage}</span>
                                 <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={currentPage >= Math.max(numPagesA, numPagesB)} className="h-8 w-8 rounded-md"><ChevronRight size={16} /></Button>
                             </div>
                             
                             <div className="h-6 w-px bg-white/10 mx-2"></div>
                             
                             <Button variant="ghost" onClick={() => { setFileA(null); setFileB(null); }} className="text-red-400 hover:bg-red-500/10 h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider">
                                 New Compare
                             </Button>
                         </div>
                    </Card>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-3xl overflow-hidden relative min-h-[600px] flex items-center justify-center p-8">
                         {mode === "side" ? (
                             <div className="grid grid-cols-2 gap-8 w-full h-full">
                                 {/* View A */}
                                 <div className="flex flex-col gap-2">
                                     <div className="text-center text-blue-400 font-bold text-sm uppercase tracking-widest bg-blue-500/10 py-2 rounded-t-xl border-t border-x border-blue-500/20">Document A</div>
                                     <div className="flex-1 bg-slate-900/50 rounded-b-xl border border-white/5 flex items-start justify-center overflow-auto p-4 custom-scrollbar">
                                         <Document file={fileA} onLoadSuccess={({numPages}) => setNumPagesA(numPages)}>
                                             <Page pageNumber={currentPage} className="shadow-2xl" renderTextLayer={false} renderAnnotationLayer={false} />
                                         </Document>
                                     </div>
                                 </div>
                                 {/* View B */}
                                 <div className="flex flex-col gap-2">
                                     <div className="text-center text-cyan-400 font-bold text-sm uppercase tracking-widest bg-cyan-500/10 py-2 rounded-t-xl border-t border-x border-cyan-500/20">Document B</div>
                                     <div className="flex-1 bg-slate-900/50 rounded-b-xl border border-white/5 flex items-start justify-center overflow-auto p-4 custom-scrollbar">
                                         <Document file={fileB} onLoadSuccess={({numPages}) => setNumPagesB(numPages)}>
                                             <Page pageNumber={currentPage} className="shadow-2xl" renderTextLayer={false} renderAnnotationLayer={false} />
                                         </Document>
                                     </div>
                                 </div>
                             </div>
                         ) : (
                             <div className="relative w-full h-full flex items-center justify-center overflow-auto custom-scrollbar">
                                 <div className="relative shadow-2xl">
                                     {/* Base Layer (A) */}
                                     <div className="relative z-10">
                                        <Document file={fileA} onLoadSuccess={({numPages}) => setNumPagesA(numPages)}>
                                             <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} />
                                        </Document>
                                     </div>
                                     
                                     {/* Overlay Layer (B) */}
                                     <div 
                                        className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply" 
                                        style={{ opacity: opacity[0] / 100 }}
                                     >
                                        <Document file={fileB} onLoadSuccess={({numPages}) => setNumPagesB(numPages)}>
                                             <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} />
                                        </Document>
                                     </div>
                                 </div>

                                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur-md rounded-full text-xs font-bold text-white flex gap-4 pointer-events-none z-30 border border-white/10">
                                     <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> Doc A (Base)</span>
                                     <span className="w-px h-full bg-white/20"></span>
                                     <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/50"></div> Doc B (Overlay)</span>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}
