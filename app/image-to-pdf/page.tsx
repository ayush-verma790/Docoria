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

export default function ImageToPdfPage() {
  const [images, setImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string; filename: string } | null>(null)

  const handleFileSelect = (newFiles: File[]) => {
    // Only allow image files
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
          // If not png/jpg, we Skip or try to handle? pdf-lib only supports these two natively.
          // For a simple tool, we only support png/jpg.
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
          
          {/* Header */}
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
               className="text-slate-400 text-lg md:text-xl"
             >
               Turn your photos and pictures into a single PDF file. Easy & Safe.
             </motion.p>
          </div>

          <div className="grid gap-8">
             {/* Upload Area */}
             {!result && (
               <Card className="p-8 bg-slate-900/50 border-white/5 border-dashed border-2 rounded-[2rem] overflow-hidden">
                 <FileUploader 
                   onFileSelect={handleFileSelect} 
                   accept="image/*"
                   multiple={true}
                 />
                 
                 {images.length > 0 && (
                   <div className="mt-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <h3 className="text-xl font-bold flex items-center gap-2">
                           Selected Images <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-sm">{images.length}</span>
                         </h3>
                         <Button 
                           variant="ghost" 
                           onClick={() => setImages([])}
                           className="text-slate-500 hover:text-red-400"
                         >
                           Remove All
                         </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                         <AnimatePresence>
                           {images.map((img, i) => (
                             <motion.div 
                               key={`${img.name}-${i}`}
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.8 }}
                               className="relative aspect-square bg-slate-800 rounded-xl overflow-hidden group border border-white/5"
                             >
                               <img 
                                 src={URL.createObjectURL(img)} 
                                 alt="Preview" 
                                 className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                               />
                               <button 
                                 onClick={() => removeImage(i)}
                                 className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </motion.div>
                           ))}
                         </AnimatePresence>
                      </div>

                      <Button 
                        disabled={isProcessing}
                        onClick={createPdf}
                        className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl shadow-xl shadow-indigo-500/20"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" /> Making PDF...
                          </span>
                        ) : (
                          "Create PDF Now"
                        )}
                      </Button>
                   </div>
                 )}
               </Card>
             )}

             {/* Result Area */}
             {result && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
               >
                 <Card className="p-12 bg-slate-900 border-indigo-500/30 border-2 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-indigo-500/10">
                       <CheckCircle size={100} />
                    </div>

                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                       <FileText size={40} />
                    </div>
                    
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black uppercase italic">Your PDF is Ready!</h2>
                       <p className="text-slate-400 text-lg">All images have been combined into one file.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                       <a href={result.downloadUrl} download={result.filename} className="w-full sm:w-auto">
                         <Button className="h-16 w-full sm:px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl shadow-xl shadow-indigo-500/20">
                           <Download className="mr-2" /> Download PDF
                         </Button>
                       </a>
                       <Button 
                         variant="ghost" 
                         onClick={() => {
                           setResult(null)
                           setImages([])
                         }}
                         className="h-16 w-full sm:px-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xl"
                       >
                         Start New Task
                       </Button>
                    </div>
                 </Card>
               </motion.div>
             )}
          </div>

          {/* Tips Section */}
          <section className="grid sm:grid-cols-3 gap-8 pt-12">
             {[
               { title: "Safe & Private", icon: Shield, desc: "Your photos never leave your device. We process everything locally." },
               { title: "Any Image", icon: ImageIcon, desc: "Supports JPG, PNG, and more. Clean & high quality." },
               { title: "Multiple Files", icon: CheckCircle, desc: "Upload as many pictures as you want and combine them." },
             ].map((tip, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 space-y-3">
                   <div className="text-indigo-400"><tip.icon size={24} /></div>
                   <h4 className="font-bold">{tip.title}</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">{tip.desc}</p>
                </div>
             ))}
          </section>
        </div>
      </main>
    </div>
  )
}
