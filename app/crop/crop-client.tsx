"use client"

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react"
import { PDFDocument } from "pdf-lib"
import { pdfjs, Document, Page } from "react-pdf"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Crop, CheckCircle, Smartphone, Monitor } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Optional
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
     pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function CropClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Crop State (Normalized 0-1)
  // Default: 10% margins
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
  const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [pageWidth, setPageWidth] = useState(0) // Visual width of the page container

  // Handle Mouse Events for Cropping
  const handleMouseDown = (e: ReactMouseEvent, type: "move" | "nw" | "ne" | "sw" | "se") => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragType(type)
      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialCrop({ ...crop })
  }

  // Global mouse move/up handlers
  useEffect(() => {
     if (!isDragging) return
     
     const handleMouseMove = (e: MouseEvent) => {
         if (!dragStart || !dragType || !containerRef.current) return
         
         const rect = containerRef.current.getBoundingClientRect()
         const deltaX = (e.clientX - dragStart.x) / rect.width
         const deltaY = (e.clientY - dragStart.y) / rect.height
         
         let newCrop = { ...initialCrop }

         if (dragType === 'move') {
             newCrop.x = Math.max(0, Math.min(1 - newCrop.w, initialCrop.x + deltaX))
             newCrop.y = Math.max(0, Math.min(1 - newCrop.h, initialCrop.y + deltaY))
         } else if (dragType === 'se') {
             newCrop.w = Math.max(0.1, Math.min(1 - newCrop.x, initialCrop.w + deltaX))
             newCrop.h = Math.max(0.1, Math.min(1 - newCrop.y, initialCrop.h + deltaY))
         } else if (dragType === 'ne') {
             const newY = Math.max(0, Math.min(initialCrop.y + initialCrop.h - 0.1, initialCrop.y + deltaY))
             newCrop.h = initialCrop.h + (initialCrop.y - newY)
             newCrop.y = newY
             newCrop.w = Math.max(0.1, Math.min(1 - newCrop.x, initialCrop.w + deltaX))
         } else if (dragType === 'sw') {
             const newX = Math.max(0, Math.min(initialCrop.x + initialCrop.w - 0.1, initialCrop.x + deltaX))
             newCrop.w = initialCrop.w + (initialCrop.x - newX)
             newCrop.x = newX
             newCrop.h = Math.max(0.1, Math.min(1 - newCrop.y, initialCrop.h + deltaY))
         } else if (dragType === 'nw') {
             const newX = Math.max(0, Math.min(initialCrop.x + initialCrop.w - 0.1, initialCrop.x + deltaX))
             const newY = Math.max(0, Math.min(initialCrop.y + initialCrop.h - 0.1, initialCrop.y + deltaY))
             newCrop.w = initialCrop.w + (initialCrop.x - newX)
             newCrop.x = newX
             newCrop.h = initialCrop.h + (initialCrop.y - newY)
             newCrop.y = newY
         }

         setCrop(newCrop)
     }

     const handleMouseUp = () => {
         setIsDragging(false)
         setDragType(null)
     }

     window.addEventListener('mousemove', handleMouseMove)
     window.addEventListener('mouseup', handleMouseUp)

     return () => {
         window.removeEventListener('mousemove', handleMouseMove)
         window.removeEventListener('mouseup', handleMouseUp)
     }
  }, [isDragging, dragStart, dragType, initialCrop])


  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pages = pdfDoc.getPages()
        
        pages.forEach(page => {
             const { width, height } = page.getMediaBox()
             
             // Convert normalized coordinates to PDF Points
             // Note: PDF coordinates start at Bottom-Left. 
             // DOM starts at Top-Left.
             const x = width * crop.x
             const w = width * crop.w
             const h = height * crop.h
             // y = height - (domTop + domHeight)
             // domTop = crop.y * height
             // y = height - (crop.y * height + crop.h * height)
             // y = height * (1 - (crop.y + crop.h))
             const y = height * (1 - (crop.y + crop.h))
             
             page.setCropBox(x, y, w, h)
             page.setMediaBox(x, y, w, h)
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setResult({
            downloadUrl: url,
            filename: `cropped-${file.name}`
        })

    } catch (err) {
        console.error(err)
        alert("Crop failed")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#022c22] text-white selection:bg-emerald-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                     <Crop className="w-4 h-4" />
                     <span>Crop Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                     Trim <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">PDF Margins</span>
                 </h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                     Visually select the area to keep. Remove white space or focus on content.
                 </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                 
                 {/* LEFT: PREVIEW */}
                 <div className="lg:col-span-8 space-y-6">
                     <div className="bg-[#050f0a] rounded-[2rem] border border-white/5 p-8 relative min-h-[500px] flex items-center justify-center overflow-auto shadow-2xl">
                         {!file ? (
                             <div className="w-full max-w-md">
                                <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                             </div>
                         ) : (
                             <div className="relative shadow-2xl" id="pdf-container">
                                 {/* React PDF Wrapper */}
                                 <Document file={file} className="border border-white/10">
                                     <Page 
                                        pageNumber={1} 
                                        width={pageWidth || 500}
                                        onLoadSuccess={(page) => setPageWidth(Math.min(600, window.innerWidth - 100))} // Approximate responsive width
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="bg-white shadow-xl"
                                     />
                                 </Document>

                                 {/* Crop Display Wrapper - Matches Page Size */}
                                 <div 
                                    ref={containerRef}
                                    className="absolute inset-0 z-20"
                                 >
                                    {/* Dark Overlay Outside */}
                                    <div 
                                        className="absolute bg-black/60 backdrop-blur-sm pointer-events-none transition-all duration-75"
                                        style={{ top: 0, left: 0, width: '100%', height: `${crop.y * 100}%` }}
                                    />
                                    <div 
                                        className="absolute bg-black/60 backdrop-blur-sm pointer-events-none transition-all duration-75"
                                        style={{ bottom: 0, left: 0, width: '100%', height: `${(1 - (crop.y + crop.h)) * 100}%` }}
                                    />
                                    <div 
                                        className="absolute bg-black/60 backdrop-blur-sm pointer-events-none transition-all duration-75"
                                        style={{ top: `${crop.y * 100}%`, left: 0, width: `${crop.x * 100}%`, height: `${crop.h * 100}%` }}
                                    />
                                    <div 
                                        className="absolute bg-black/60 backdrop-blur-sm pointer-events-none transition-all duration-75"
                                        style={{ top: `${crop.y * 100}%`, right: 0, width: `${(1 - (crop.x + crop.w)) * 100}%`, height: `${crop.h * 100}%` }}
                                    />

                                    {/* Crop Box */}
                                    <div 
                                        className="absolute border-2 border-white cursor-move z-30 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] group"
                                        style={{
                                            left: `${crop.x * 100}%`,
                                            top: `${crop.y * 100}%`,
                                            width: `${crop.w * 100}%`,
                                            height: `${crop.h * 100}%`
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'move')}
                                    >
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity">
                                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50"></div>
                                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50"></div>
                                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50"></div>
                                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50"></div>
                                        </div>

                                        {/* Handles */}
                                        <div 
                                            className="absolute -top-3 -left-3 w-6 h-6 border-4 border-white rounded-full bg-emerald-500 shadow-lg cursor-nw-resize hover:scale-125 transition-transform"
                                            onMouseDown={(e) => handleMouseDown(e, 'nw')}
                                        />
                                        <div 
                                            className="absolute -top-3 -right-3 w-6 h-6 border-4 border-white rounded-full bg-emerald-500 shadow-lg cursor-ne-resize hover:scale-125 transition-transform"
                                            onMouseDown={(e) => handleMouseDown(e, 'ne')}
                                        />
                                        <div 
                                            className="absolute -bottom-3 -left-3 w-6 h-6 border-4 border-white rounded-full bg-emerald-500 shadow-lg cursor-sw-resize hover:scale-125 transition-transform"
                                            onMouseDown={(e) => handleMouseDown(e, 'sw')}
                                        />
                                        <div 
                                            className="absolute -bottom-3 -right-3 w-6 h-6 border-4 border-white rounded-full bg-emerald-500 shadow-lg cursor-se-resize hover:scale-125 transition-transform"
                                            onMouseDown={(e) => handleMouseDown(e, 'se')}
                                        />
                                        
                                        {/* Dimensions Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {Math.round(crop.w * 100)}% x {Math.round(crop.h * 100)}%
                                        </div>
                                    </div>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
                 
                 {/* RIGHT: CONTROLS */}
                 <div className="lg:col-span-4">
                     <Card className="bg-[#050f0a]/90 backdrop-blur-md border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                         {!result ? (
                             <div className="space-y-8 relative z-10 animate-in slide-in-from-right duration-500">
                                 <div className="space-y-4">
                                     <div className="flex items-center justify-between text-sm font-bold text-gray-400">
                                         <span>Crop Box Area</span>
                                         <div className="flex gap-2">
                                             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/5" title="Portrait">
                                                <Smartphone className="w-4 h-4 opacity-70" />
                                             </div>
                                             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/5" title="Landscape">
                                                <Monitor className="w-4 h-4 opacity-70" />
                                             </div>
                                         </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                             <div className="text-2xl font-mono font-bold text-emerald-400 mb-1">{Math.round(crop.w * 100)}%</div>
                                             <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Width</div>
                                         </div>
                                         <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                             <div className="text-2xl font-mono font-bold text-emerald-400 mb-1">{Math.round(crop.h * 100)}%</div>
                                             <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Height</div>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs leading-relaxed font-medium">
                                     Note: Cropping will apply to ALL pages in the document. The selected area will be preserved, and everything outside will be removed.
                                 </div>
                                 
                                 <div className="flex gap-2">
                                      <Button variant="ghost" onClick={() => { setFile(null); setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }) }} className="flex-1 h-14 text-emerald-400 hover:text-white hover:bg-emerald-500/10">
                                          Reset
                                      </Button>
                                      <Button 
                                        onClick={handleApply} 
                                        disabled={!file || isProcessing}
                                        className="flex-[2] h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-xl shadow-lg shadow-emerald-500/20"
                                      >
                                         {isProcessing ? <Loader2 className="animate-spin" /> : "Crop PDF"}
                                      </Button>
                                 </div>
                             </div>
                         ) : (
                             <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
                                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                      <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={3} />
                                  </div>
                                  <div>
                                      <h3 className="text-2xl font-black text-white mb-2">Cropped!</h3>
                                      <p className="text-gray-400 text-sm">Margins trimmed successfully.</p>
                                  </div>
                                  
                                  <div className="space-y-3">
                                      <a href={result.downloadUrl} download={result.filename} className="block w-full">
                                          <Button className="w-full h-14 bg-white text-emerald-950 font-black text-lg hover:bg-emerald-50 rounded-xl shadow-xl">
                                              <Download className="mr-2" strokeWidth={3} /> Download
                                          </Button>
                                      </a>
                                      <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}} className="text-gray-400 hover:text-white text-sm">
                                          Crop Another
                                      </Button>
                                  </div>
                             </div>
                         )}
                     </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}
