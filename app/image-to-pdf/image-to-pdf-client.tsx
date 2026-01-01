"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Image as ImageIcon, FileText, Download, Trash2, ArrowUp, CheckCircle, Loader2, Shield } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { cn } from "@/lib/utils"

export default function ImageToPdfClient() {
  const [images, setImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string; filename: string } | null>(null)

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
        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else {
          continue
        }
        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
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
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <SiteHeader />
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
             >
               <ImageIcon size={32} />
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-4xl md:text-6xl font-black tracking-tight italic"
             >
                IMAGES TO PDF
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-slate-500 text-lg max-w-xl mx-auto"
             >
                Turn your photos, screenshots, and graphics into a single, professional PDF document in seconds.
             </motion.p>
          </div>
          {!result ? (
            <div className="space-y-8">
              <Card className="p-1 rounded-3xl bg-slate-900/50 border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
                 <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-slate-950/50">
                   <FileUploader 
                    multiple
                    onFileSelect={handleFileSelect} 
                    accept="image/*" 
                   />
                 </div>
              </Card>
              {images.length > 0 && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                 >
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{images.length} Images Selected</span>
                        <Button 
                            variant="ghost" 
                            onClick={() => setImages([])}
                            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            Clear All
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AnimatePresence>
                        {images.map((file, i) => (
                           <motion.div 
                            key={`${file.name}-${i}`}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="group relative aspect-[3/4] rounded-2xl bg-slate-900 border border-white/5 overflow-hidden shadow-lg"
                           >
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt="preview" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button 
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                           </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                    <div className="pt-8 flex justify-center">
                        <Button 
                            onClick={createPdf}
                            disabled={isProcessing}
                            className="h-16 px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            {isProcessing ? (
                                <><Loader2 className="mr-3 animate-spin" /> GENERATING...</>
                            ) : (
                                <><FileText className="mr-3" /> CONVERT TO PDF</>
                            )}
                        </Button>
                    </div>
                 </motion.div>
              )}
            </div>
          ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
            >
                <Card className="p-12 text-center bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-2xl rounded-[3rem]">
                    <div className="w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle size={48} className="animate-in zoom-in duration-500" />
                    </div>
                    <h3 className="text-3xl font-black mb-2 italic">PDF CREATED!</h3>
                    <p className="text-slate-500 mb-10 font-medium">Your images have been combined into a single document.</p>
                    <div className="space-y-4">
                        <a href={result.downloadUrl} download={result.filename} className="block w-full">
                            <Button className="w-full h-16 bg-white text-slate-950 hover:bg-indigo-400 font-black text-lg rounded-2xl shadow-xl transition-all">
                                <Download className="mr-2" /> DOWNLOAD NOW
                            </Button>
                        </a>
                        <Button 
                            variant="ghost" 
                            onClick={() => {setResult(null); setImages([]);}}
                            className="text-slate-500 hover:text-white"
                        >
                            START A NEW ONE
                        </Button>
                    </div>
                </Card>
            </motion.div>
          )}
        </div>
      </main>
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/5 rounded-full backdrop-blur-md opacity-50">
          <Shield size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Browser Processing</span>
      </div>
    </div>
  )
}
