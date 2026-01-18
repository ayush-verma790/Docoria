"use client"

import { useState } from "react"
import { pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Image as ImageIcon, Archive, RefreshCw, Layers, ZoomIn } from "lucide-react"
import JSZip from "jszip"
import { motion, AnimatePresence } from "framer-motion"

// Initialize worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

interface ExtractedImage {
    id: string
    url: string
    blob: Blob
    width: number
    height: number
    size: number
    type: "png" | "jpeg"
}

export default function ExtractImagesClient() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<ExtractedImage[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState(0)

  // Logic to extract images
  const handleExtract = async () => {
      if (!file) return
      setIsExtracting(true)
      setImages([])
      setProgress(0)

      try {
          const buffer = await file.arrayBuffer()
          const loadingTask = pdfjs.getDocument(buffer)
          const doc = await loadingTask.promise
          const numPages = doc.numPages
          
          const foundImages: ExtractedImage[] = []

          for (let p = 1; p <= numPages; p++) {
              setProgress(Math.round((p / numPages) * 100))
              const page = await doc.getPage(p)
              const ops = await page.getOperatorList()
              
              const imgNames: string[] = []
              
              // Find image operators
              // @ts-ignore
              for (let i = 0; i < ops.fn.length; i++) {
                  // @ts-ignore
                  if (ops.fn[i] === pdfjs.OPS.paintImageXObject || ops.fn[i] === pdfjs.OPS.paintJpegXObject) {
                      // @ts-ignore
                      const name = ops.args[i][0]
                      imgNames.push(name)
                  }
              }

              // Extract data
              for (const name of imgNames) {
                  try {
                      // @ts-ignore - 'objs' is internal but accessible
                      const img = await page.objs.get(name)
                      if (!img) continue

                      const canvas = document.createElement('canvas')
                      canvas.width = img.width
                      canvas.height = img.height
                      const ctx = canvas.getContext('2d')
                      if (!ctx) continue

                      // If it's a raw bitmap
                      if (img.kind !== undefined) {
                           // Standard image object from pdfjs
                           // Need to put image data
                           // Note: This matches simple bitmaps. 
                           // For JPEGs often pdfjs handles them differently but objs.get usually returns the decoded bitmap.
                           
                           const imgData = ctx.createImageData(img.width, img.height)
                           // Copy data
                           if (img.data.length === img.width * img.height * 4) {
                               // RGBA
                               imgData.data.set(img.data)
                           } else if (img.data.length === img.width * img.height * 3) {
                               // RGB -> RGBA
                               let j = 0
                               for (let k = 0; k < img.data.length; k += 3) {
                                   imgData.data[j++] = img.data[k]
                                   imgData.data[j++] = img.data[k + 1]
                                   imgData.data[j++] = img.data[k + 2]
                                   imgData.data[j++] = 255
                               }
                           } else {
                               // Fallback: GrayScale or other
                               // Skipping complex formats for MVP or handling transparently if possible
                               // Often pdfjs normalizes to RGBA in 'data'
                               imgData.data.set(img.data)
                           }
                           
                           ctx.putImageData(imgData, 0, 0)
                           
                           const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
                           if (blob) {
                               foundImages.push({
                                   id: `${p}-${name}-${Math.random()}`,
                                   url: URL.createObjectURL(blob),
                                   blob,
                                   width: img.width,
                                   height: img.height,
                                   size: blob.size,
                                   type: "png"
                               })
                           }
                      }
                  } catch (e) {
                      console.warn("Could not extract image", name, e)
                  }
              }
              
              // Clean up page resources
              page.cleanup()
          }
          
          setImages(foundImages)
      } catch (err) {
          console.error(err)
          alert("Failed to extract images from this PDF.")
      } finally {
          setIsExtracting(false)
          setProgress(0)
      }
  }

  const handleDownloadAll = async () => {
      const zip = new JSZip()
      const folder = zip.folder("extracted-images")
      
      images.forEach((img, i) => {
          folder?.file(`image-${i + 1}.${img.type}`, img.blob)
      })
      
      const content = await zip.generateAsync({ type: "blob" })
      
      // Manual download trigger
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = `extracted_images_${Date.now()}.zip` // Corrected filename string
      a.click()
  }

  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans selection:bg-rose-500/30">
        <SiteHeader />
        
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute bottom-[10%] right-[30%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-[0_0_40px_rgba(244,63,94,0.2)]"
                  >
                      <Layers className="w-10 h-10 text-rose-500" />
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                      Extract <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Images</span>
                  </h1>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                      Pull every photo and graphic out of your PDF in seconds.
                  </p>
             </div>

             <div className="grid lg:grid-cols-[400px,1fr] gap-8 items-start">
                  
                  {/* Left: Input & Stats */}
                  <div className="space-y-6">
                      <Card className="p-8 bg-slate-900/50 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden relative">
                           {!file ? (
                               <div className="space-y-6">
                                   <FileUploader onFileSelect={(f) => setFile(f[0])} accept=".pdf" />
                                   <div className="text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
                                       Supports High-Res Extraction
                                   </div>
                               </div>
                           ) : (
                               <div className="space-y-6 text-center">
                                   <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
                                       <div className="text-xs font-bold text-slate-400">PDF</div>
                                   </div>
                                   <div>
                                       <h3 className="text-lg font-bold truncate">{file.name}</h3>
                                       <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                   </div>
                                   <div className="flex gap-2">
                                       <Button 
                                            onClick={handleExtract} 
                                            disabled={isExtracting}
                                            className="flex-1 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold h-12 rounded-xl shadow-lg"
                                        >
                                           {isExtracting ? <Loader2 className="animate-spin" /> : "Start Extraction"}
                                       </Button>
                                       <Button variant="outline" size="icon" onClick={() => { setFile(null); setImages([]); }} className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5">
                                           <RefreshCw size={18} />
                                       </Button>
                                   </div>
                                   {isExtracting && (
                                       <div className="space-y-2">
                                           <div className="flex justify-between text-xs font-bold text-rose-400">
                                               <span>Scanning Pages...</span>
                                               <span>{progress}%</span>
                                           </div>
                                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                               <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                           </div>
                                       </div>
                                   )}
                               </div>
                           )}
                      </Card>

                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                          <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                              <Archive size={18} /> Extraction Stats
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-black/20 rounded-xl">
                                  <div className="text-2xl font-black text-white">{images.length}</div>
                                  <div className="text-[10px] uppercase text-slate-500 tracking-wider">Images Found</div>
                              </div>
                              <div className="p-4 bg-black/20 rounded-xl">
                                  <div className="text-2xl font-black text-rose-400">
                                      {(images.reduce((acc, curr) => acc + curr.size, 0) / 1024 / 1024).toFixed(2)}
                                  </div>
                                  <div className="text-[10px] uppercase text-slate-500 tracking-wider">Total Size (MB)</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right: Gallery */}
                  <div className="min-h-[600px] bg-slate-950/30 border border-white/5 rounded-[2.5rem] p-8 relative">
                      {images.length > 0 ? (
                          <div className="space-y-8">
                               <div className="flex items-center justify-between">
                                   <h3 className="text-xl font-bold flex items-center gap-2">
                                       <ImageIcon className="text-rose-500" /> Extracted Assets
                                   </h3>
                                   <Button onClick={handleDownloadAll} className="bg-white text-black hover:bg-slate-200 font-bold rounded-xl">
                                       <Download className="mr-2" size={18} /> Download All (ZIP)
                                   </Button>
                               </div>

                               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                   <AnimatePresence>
                                       {images.map((img, i) => (
                                           <motion.div 
                                                key={img.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group relative aspect-square bg-[#000000] rounded-xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-colors"
                                           >
                                               <img src={img.url} alt={`Extracted ${i}`} className="w-full h-full object-contain p-2" />
                                               
                                               <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                                   <div className="text-xs text-slate-300 font-mono">
                                                       {img.width} x {img.height}
                                                   </div>
                                                   <div className="text-xs font-bold bg-rose-500/20 text-rose-400 px-2 py-1 rounded">
                                                       {(img.size / 1024).toFixed(1)} KB
                                                   </div>
                                                   <a href={img.url} download={`image-${i+1}.${img.type}`}>
                                                       <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                                           <Download size={18} />
                                                       </Button>
                                                   </a>
                                               </div>
                                           </motion.div>
                                       ))}
                                    </AnimatePresence>
                               </div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-50">
                              <div className="w-32 h-32 border-4 border-dashed border-slate-700 rounded-3xl flex items-center justify-center mb-6">
                                  <ImageIcon size={48} />
                              </div>
                              <p className="text-xl font-medium">Images will appear here</p>
                              <p className="text-sm">Upload a PDF to start extracting</p>
                          </div>
                      )}
                  </div>
             </div>
        </div>
    </div>
  )
}
