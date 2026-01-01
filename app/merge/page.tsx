"use client"

import { useState, useCallback, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Layers, RotateCw, Trash2, ArrowRight, ArrowLeft, GripVertical, Check, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PageItem {
  id: string
  fileIndex: number
  pageIndex: number // 0-based index in the source file
  rotation: number // 0, 90, 180, 270
}

const COLORS = [
    "bg-violet-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-blue-500",
]

export default function AdvancedMergePage() {
  // Steps: 0 = Upload, 1 = Organize/Merge
  const [step, setStep] = useState(0)
  
  const [files, setFiles] = useState<File[]>([])
  // We need to know how many pages each file has to generate initial PageItems
  // Map fileIndex -> numPages
  const [filePageCounts, setFilePageCounts] = useState<Record<number, number>>({})
  const [pages, setPages] = useState<PageItem[]>([])
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [error, setError] = useState("")

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // --- Handlers ---

  const handleFilesSelected = (newFiles: File[]) => {
    // Append
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove))
    // Also remove page counts? We'll just re-calc everything when moving to step 1
  }

  // Map fileIndex -> Blob URL (string)
  const [fileUrls, setFileUrls] = useState<Record<number, string>>({})

  // ... (previous code)

  // Pre-load page counts using pdfjs directly to be fast before rendering grid
  const preparePages = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files.")
      return
    }
    
    setIsProcessing(true)
    setError("")

    try {
       const counts: Record<number, number> = {}
       const urls: Record<number, string> = {}
       const newPages: PageItem[] = []

       for (let i = 0; i < files.length; i++) {
           const file = files[i]
           // Create Blob URL for stability
           const url = URL.createObjectURL(file)
           urls[i] = url

           // Load to get page count
           const pdf = await pdfjs.getDocument(url).promise
           counts[i] = pdf.numPages
           
           // Generate initial items
           for (let p = 0; p < pdf.numPages; p++) {
               newPages.push({
                   id: `f${i}-p${p}-${Math.random()}`,
                   fileIndex: i,
                   pageIndex: p,
                   rotation: 0
               })
           }
       }

       setFileUrls(urls)
       setFilePageCounts(counts)
       setPages(newPages)
       setStep(1)
    } catch (err) {
       console.error(err)
       setError("Failed to load PDF metadata. Please ensure files are valid PDFs.")
    } finally {
        setIsProcessing(false)
    }
  }

  // Cleanup URLs on unmount
  useEffect(() => {
     return () => {
         Object.values(fileUrls).forEach(url => URL.revokeObjectURL(url))
     }
  }, [fileUrls])

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === index) return
      
      const newPages = [...pages]
      const [moved] = newPages.splice(draggedIndex, 1)
      newPages.splice(index, 0, moved)
      setPages(newPages)
      setDraggedIndex(index)
  }
  const handleDragEnd = () => setDraggedIndex(null)

  const rotatePage = (index: number) => {
      const newPages = [...pages]
      newPages[index].rotation = (newPages[index].rotation + 90) % 360
      setPages(newPages)
  }

  const deletePage = (index: number) => {
      if (pages.length <= 1) return
      setPages(prev => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
      setIsProcessing(true)
      try {
          const formData = new FormData()
          files.forEach(f => formData.append("files", f))
          
          // Map pages to a lighter structure for sending
          const sequence = pages.map(p => ({
              fileIndex: p.fileIndex,
              pageIndex: p.pageIndex,
              rotation: p.rotation
          }))
          
          formData.append("sequence", JSON.stringify(sequence))

          const res = await fetch("/api/merge/advanced", {
              method: "POST",
              body: formData
          })
          
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Merge failed")
          
          setResult(data)
      } catch (err) {
          setError(err instanceof Error ? err.message : "Merge failed")
      } finally {
          setIsProcessing(false)
      }
  }

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30 selection:text-violet-200">
         <SiteHeader />
         
         {/* Bg */}
         <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
         </div>

         <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-12">

             
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                 <div>
                     <h1 className="text-3xl font-bold mb-2">Combine PDFs</h1>
                     <p className="text-slate-400">Join different PDF files together and change their page order easily.</p>
                 </div>
                {step === 1 && !result && (
                    <div className="flex gap-2">
                         <Button variant="ghost" className="text-slate-400" onClick={() => setStep(0)}>
                             Add more files
                         </Button>
                         <Button 
                            className="bg-white text-slate-900 font-bold hover:bg-slate-200"
                            onClick={handleMerge}
                            disabled={isProcessing}
                         >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Layers className="mr-2" />}
                            Merge {pages.length} Pages
                         </Button>
                    </div>
                )}
             </div>

             <AnimatePresence mode="wait">
                 {/* STEP 0: UPLOAD */}
                 {step === 0 && (
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 max-w-2xl mx-auto"
                     >
                         <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md">
                             <FileUploader onFileSelect={handleFilesSelected} accept=".pdf" multiple />
                         </Card>

                         {files.length > 0 && (
                             <Card className="p-4 bg-slate-900/50 border-white/10 divide-y divide-white/5">
                                 {files.map((file, i) => (
                                     <div key={i} className="flex items-center justify-between py-3 px-2">
                                         <div className="flex items-center gap-3">
                                             <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${COLORS[i % COLORS.length]}`}>
                                                 {i + 1}
                                             </div>
                                             <div className="text-sm font-medium">{file.name}</div>
                                             <div className="text-xs text-slate-500">{(file.size/1024/1024).toFixed(1)}MB</div>
                                         </div>
                                         <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 p-2">
                                             <X size={16} />
                                         </button>
                                     </div>
                                 ))}
                             </Card>
                         )}

                         <div className="flex justify-end">
                            <Button 
                                size="lg" 
                                className="rounded-full px-8 bg-violet-600 hover:bg-violet-700 font-bold"
                                disabled={files.length < 2 || isProcessing}
                                onClick={preparePages}
                            >
                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Next Step"} <ArrowRight className="ml-2" />
                            </Button>
                         </div>
                         {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                     </motion.div>
                 )}

                 {/* STEP 1: ORGANIZE (GRID) */}
                 {step === 1 && !result && (
                     <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                     >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {pages.map((page, index) => (
                                <motion.div
                                    key={page.id}
                                    layout
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "relative group cursor-grab active:cursor-grabbing",
                                        draggedIndex === index && "opacity-50"
                                    )}
                                >
                                    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-800 hover:border-violet-500 hover:shadow-lg transition-all">
                                        
                                        {/* Source Badge */}
                                        <div className={`absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${COLORS[page.fileIndex % COLORS.length]}`}>
                                            File {page.fileIndex + 1}
                                        </div>
                                        
                                        {/* Page Number */}
                                        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
                                            #{page.pageIndex + 1}
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-2">
                                             <button onClick={() => rotatePage(index)} className="p-2 bg-white rounded-full hover:bg-slate-200 text-slate-900">
                                                 <RotateCw size={16} />
                                             </button>
                                             <button onClick={() => deletePage(index)} className="p-2 bg-white rounded-full hover:bg-red-100 text-red-600">
                                                 <Trash2 size={16} />
                                             </button>
                                        </div>

                                        {/* Render */}
                                        <div className="aspect-[3/4] bg-white flex items-center justify-center relative overflow-hidden select-none">
                                            {/* IMPORTANT: Use Document for EACH page. It caches so it's efficient enough. */}
                                            <Document 
                                                file={fileUrls[page.fileIndex]} 
                                                loading={<div className="w-full h-full bg-slate-100 animate-pulse" />}
                                                className="flex items-center justify-center w-full h-full"
                                                error={<div className="text-red-500 text-[10px] p-2">Error loading page</div>}
                                            >
                                                <Page 
                                                    pageNumber={page.pageIndex + 1} 
                                                    width={150} 
                                                    rotate={page.rotation}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false} 
                                                />
                                            </Document>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                     </motion.div>
                 )}

                 {/* RESULT */}
                 {result && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto text-center py-12 space-y-8"
                     >
                          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                                <Check className="w-12 h-12 text-emerald-400" />
                          </div>
                          <div>
                              <h2 className="text-3xl font-bold mb-2">Merge Complete!</h2>
                              <p className="text-slate-400">Your custom document is ready.</p>
                          </div>
                          <div className="flex justify-center gap-4">
                                <a href={result.downloadUrl} download={result.filename}>
                                    <Button className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg">
                                        <Download className="mr-2" /> Download PDF
                                    </Button>
                                </a>
                                <Button variant="ghost" onClick={() => {setResult(null); setStep(0); setFiles([]); setPages([])}} className="h-14 px-8 rounded-full text-white hover:bg-white/10">
                                    Start Over
                                </Button>
                          </div>
                     </motion.div>
                 )}
             </AnimatePresence>
         </div>
    </div>
  )
}
