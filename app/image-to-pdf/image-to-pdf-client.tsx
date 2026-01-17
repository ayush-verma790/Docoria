"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Image as ImageIcon, FileText, Download, Trash2, ArrowUp, CheckCircle, Loader2, Shield, Settings2, Move, LayoutTemplate, Maximize, Scan } from "lucide-react"
import { PDFDocument, PageSizes } from "pdf-lib"
import { cn } from "@/lib/utils"

type PageSize = 'A4' | 'Letter' | 'Fit'
type ImageFit = 'contain' | 'cover' | 'original'
type MarginSize = 'none' | 'small' | 'medium'

export default function ImageToPdfClient() {
  const [images, setImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string; filename: string } | null>(null)
  
  // Settings
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [imageFit, setImageFit] = useState<ImageFit>('contain')
  const [margin, setMargin] = useState<MarginSize>('small')

  const handleFileSelect = (newFiles: File[]) => {
    const validImages = newFiles.filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...validImages])
    setResult(null)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setResult(null)
  }

  const createPdf = async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    try {
      const pdfDoc = await PDFDocument.create()
      
      for (const imageFile of images) {
        const imageBytes = await imageFile.arrayBuffer()
        let image
        let dims
        
        try {
            if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
              image = await pdfDoc.embedJpg(imageBytes)
            } else if (imageFile.type === 'image/png') {
              image = await pdfDoc.embedPng(imageBytes)
            } else {
               // Try falling back to PNG if unknown, or skip
              continue
            }
            dims = image.scale(1)
        } catch (e) {
            console.error("Failed to embed image", e)
            continue
        }

        // Determine Page Dimensions
        let pageWidth, pageHeight
        if (pageSize === 'A4') [pageWidth, pageHeight] = PageSizes.A4
        else if (pageSize === 'Letter') [pageWidth, pageHeight] = PageSizes.Letter
        else {
            pageWidth = dims.width
            pageHeight = dims.height
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight])
        const { width, height } = page.getSize()

        // Calculate Margins
        let marginVal = 0
        if (margin === 'small') marginVal = 20
        if (margin === 'medium') marginVal = 50

        const drawWidth = width - (marginVal * 2)
        const drawHeight = height - (marginVal * 2)

        // Calculate Image Placement
        let imgW = dims.width
        let imgH = dims.height
        let imgX = marginVal
        let imgY = marginVal

        if (pageSize !== 'Fit') {
             if (imageFit === 'contain') {
                 // Letterbox
                 const scale = Math.min(drawWidth / imgW, drawHeight / imgH)
                 imgW = imgW * scale
                 imgH = imgH * scale
                 imgX = (width - imgW) / 2
                 imgY = (height - imgH) / 2
             } else if (imageFit === 'cover') {
                 // Zoom to fill (might crop, but pdf-lib draws full image usually, we just scale to fill biggest dim)
                 const scale = Math.max(drawWidth / imgW, drawHeight / imgH)
                 imgW = imgW * scale
                 imgH = imgH * scale
                 // Centered crop effect not easily possible without masking, so we just center what fits or let it overflow if we had clipping paths.
                 // For now, let's treat 'cover' as 'match width' which is common for docs
                 const scaleW = drawWidth / imgW
                 imgW = imgW * scaleW
                 imgH = imgH * scaleW
                 imgX = marginVal
                 imgY = height - imgH - marginVal // Top align for documents usually
             } else {
                 // Original - center it
                 imgX = (width - imgW) / 2
                 imgY = (height - imgH) / 2
             }
        } else {
            // Auto fit page to image
            imgX = 0
            imgY = 0
        }

        page.drawImage(image, {
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setResult({
        downloadUrl: url,
        filename: `images-combined-${Date.now()}.pdf`
      })
    } catch (error) {
      console.error("Error creating PDF:", error)
      alert("Something went wrong while making the PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      <SiteHeader />
       {/* Background */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 mb-4"
             >
               <ImageIcon size={32} />
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-5xl md:text-7xl font-black tracking-tighter text-white"
             >
                IMAGES TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PDF</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-slate-400 text-xl max-w-2xl mx-auto font-light"
             >
                Professional photo to document converter. Reorder, resize, and styling included.
             </motion.p>
          </div>

          {!result ? (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
               {/* Main Editor Area */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/0 shadow-2xl">
                     <div className="p-8 rounded-[2.3rem] bg-[#0A0A0F] border border-white/5 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50"></div>
                        <FileUploader 
                            multiple
                            onFileSelect={handleFileSelect} 
                            accept="image/*" 
                        />
                     </div>
                  </div>

                  {images.length > 0 && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                     >
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Move size={12} /> Drag to Reorder
                            </h3>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setImages([])}
                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
                            >
                                Clear All
                            </Button>
                        </div>
                        
                        <Reorder.Group axis="y" values={images} onReorder={setImages} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                           {images.map((file) => (
                              <Reorder.Item key={file.name} value={file} className="aspect-[3/4] relative group touch-none">
                                  <div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative shadow-lg group-hover:shadow-indigo-500/20 group-hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing">
                                     <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="preview" 
                                        className="w-full h-full object-cover"
                                     />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); removeImage(images.indexOf(file)); }}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transform scale-90 hover:scale-100 transition-all"
                                         >
                                            <Trash2 size={18} />
                                         </button>
                                     </div>
                                     <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                                         {images.indexOf(file) + 1}
                                     </div>
                                  </div>
                              </Reorder.Item>
                           ))}
                        </Reorder.Group>
                     </motion.div>
                  )}
               </div>

               {/* Settings Sidebar */}
               <div className="space-y-6">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl sticky top-32">
                    <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                        <Settings2 className="text-indigo-400" /> PDF Settings
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Size</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['A4', 'Letter', 'Fit'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setPageSize(s as any)}
                                        className={cn(
                                            "p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2",
                                            pageSize === s 
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                        )}
                                    >
                                        <LayoutTemplate size={16} />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Image Fit</Label>
                             <div className="grid grid-cols-3 gap-2">
                                {['contain', 'cover', 'original'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setImageFit(s as any)}
                                        className={cn(
                                            "p-3 rounded-xl border text-[10px] uppercase font-bold transition-all flex flex-col items-center gap-2",
                                            imageFit === s 
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                        )}
                                    >
                                        {s === 'contain' && <Scan size={16} />}
                                        {s === 'cover' && <Maximize size={16} />}
                                        {s === 'original' && <ImageIcon size={16} />}
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500">
                                {imageFit === 'contain' && "Shrinks image to fit on the page."}
                                {imageFit === 'cover' && "Zooms image to fill width (may crop)."}
                                {imageFit === 'original' && "Uses actual image dimensions."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Margins</Label>
                             <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                                {['none', 'small', 'medium'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMargin(m as any)}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                                            margin === m ? "bg-white/10 text-white shadow" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <Button 
                            onClick={createPdf}
                            disabled={isProcessing || images.length === 0}
                            className="w-full h-14 bg-white text-black hover:bg-indigo-50 font-black text-lg rounded-xl shadow-xl transition-transform hover:scale-[1.02] mt-4"
                        >
                            {isProcessing ? (
                                <><Loader2 className="mr-2 animate-spin" /> GENERATING...</>
                            ) : (
                                "CONVERT NOW"
                            )}
                        </Button>
                    </div>
                 </div>
               </div>
            </div>
          ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
            >
                <div className="p-1 rounded-[3rem] bg-gradient-to-b from-emerald-500/20 to-emerald-500/0">
                    <Card className="p-12 text-center bg-[#0A0A0F] border-white/10 backdrop-blur-xl shadow-2xl rounded-[3rem] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_10px_40px_rgba(16,185,129,0.3)] animate-float">
                                <CheckCircle size={48} className="animate-in zoom-in duration-500" strokeWidth={3} />
                            </div>
                            <h3 className="text-4xl font-black mb-4 text-white">PDF Ready!</h3>
                            <p className="text-slate-400 mb-10 text-lg">Your images have been compiled successfully.</p>
                            
                            <div className="space-y-4">
                                <a href={result.downloadUrl} download={result.filename} className="block w-full">
                                    <Button className="w-full h-16 bg-white text-black hover:bg-slate-200 font-black text-xl rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                                        <Download className="mr-2" size={24} /> Download PDF
                                    </Button>
                                </a>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => {setResult(null); setImages([]);}}
                                    className="text-slate-500 hover:text-white w-full h-12"
                                >
                                    Convert Another Batch
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </motion.div>
          )}
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/5 rounded-full backdrop-blur-md opacity-50 hover:opacity-100 transition-opacity">
          <Shield size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Client-Side Processing</span>
      </div>
    </div>
  )
}
