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

interface PageItem {
  id: string
  fileIndex: number
  pageIndex: number 
  rotation: number 
}

const COLORS = [
    "bg-violet-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-blue-500",
]

export default function MergeClient() {
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [filePageCounts, setFilePageCounts] = useState<Record<number, number>>({})
  const [pages, setPages] = useState<PageItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const handleFilesSelected = (newFiles: File[]) => {
    // Basic deduplication based on name+size might be good, but users might want to merge same file twice.
    // However, if the issue is a bug where dropping 1 adds 2, it's likely double invocation.
    // We will trust the input for now but maybe checking FileUploader later.
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove))
  }

  const [fileUrls, setFileUrls] = useState<Record<number, string>>({})

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
           const url = URL.createObjectURL(file)
           urls[i] = url
           const pdf = await pdfjs.getDocument(url).promise
           counts[i] = pdf.numPages
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

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 selection:text-white">
         {/* Dynamic Background Atmosphere */}
         <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
         </div>

         <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12">
             <div className="flex items-center justify-between mb-12">
                  <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-primary/20 text-xs font-semibold text-primary">
                          <Layers size={14} /> <span>PDF Merge Studio</span>
                      </div>
                      <h1 className="text-5xl font-black tracking-tight text-white">Combine PDFs</h1>
                      <p className="text-lg text-muted-foreground max-w-xl font-light">Join different PDF files together and change their page order easily.</p>
                  </div>
                {step === 1 && !result && (
                    <div className="flex gap-3">
                         <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => setStep(0)}>
                             <Plus className="mr-2" size={16} /> Add Files
                         </Button>
                         <Button 
                            className="h-12 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
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
                  {step === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8 max-w-3xl mx-auto"
                      >
                          <div className="p-10 rounded-[2.5rem] bg-[#0A0A0F]/60 border border-white/5 shadow-2xl relative overflow-hidden group backdrop-blur-xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                              <FileUploader onFileSelect={handleFilesSelected} accept=".pdf" multiple />
                          </div>
                          
                          {files.length > 0 && (
                              <div className="p-6 rounded-[2rem] bg-[#0A0A0F]/60 border border-white/5 space-y-4 backdrop-blur-xl">
                                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Selected Files</h3>
                                  <div className="space-y-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${COLORS[i % COLORS.length]}`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-indigo-200 transition-colors">{file.name}</div>
                                                    <div className="text-xs text-gray-400">{(file.size/1024/1024).toFixed(1)}MB</div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-all">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                  </div>
                                  <div className="pt-4">
                                      {error && <div className="text-sm text-red-200 mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center flex items-center justify-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>{error}</div>}
                                      <Button className="w-full h-14 bg-white text-black hover:bg-indigo-50 font-bold text-lg rounded-xl shadow-lg shadow-white/10" onClick={preparePages} disabled={isProcessing}>
                                          {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                                          Next: Organize Pages
                                      </Button>
                                  </div>
                              </div>
                          )}
                      </motion.div>
                  )}
                  {step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                         {!result ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                              {pages.map((page, i) => (
                                  <div 
                                      key={page.id}
                                      draggable
                                      onDragStart={() => handleDragStart(i)}
                                      onDragOver={(e) => handleDragOver(e, i)}
                                      onDragEnd={handleDragEnd}
                                      className={cn(
                                          "group relative space-y-3 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-2 duration-300",
                                          draggedIndex === i ? "opacity-30 scale-95" : "opacity-100"
                                      )}
                                  >
                                      <div className="relative aspect-[3/4] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group-hover:border-primary/50 group-hover:shadow-[0_10px_30px_rgba(var(--primary),0.2)] transition-all">
                                          <div className="absolute top-2 left-2 z-10">
                                               <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${COLORS[page.fileIndex % COLORS.length]}`}>
                                                   {page.fileIndex + 1}
                                               </div>
                                          </div>
                                          <Document file={fileUrls[page.fileIndex]} className="w-full h-full scale-[0.6] origin-top opacity-90 group-hover:opacity-100 transition-opacity">
                                              <Page 
                                                pageNumber={page.pageIndex + 1} 
                                                rotate={page.rotation} 
                                                width={200} 
                                                renderTextLayer={false} 
                                                renderAnnotationLayer={false}
                                                loading={<div className="w-full h-full bg-white/5 animate-pulse" />}
                                              />
                                          </Document>
                                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                              <button onClick={() => rotatePage(i)} className="p-2 bg-white/10 hover:bg-primary rounded-lg transition-colors backdrop-blur-md border border-white/10"><RotateCw size={14} className="text-white" /></button>
                                              <button onClick={() => deletePage(i)} className="p-2 bg-white/10 hover:bg-red-500 rounded-lg transition-colors backdrop-blur-md border border-white/10"><Trash2 size={14} className="text-white" /></button>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-center gap-2">
                                          <GripVertical size={12} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                          <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors uppercase tracking-widest">Page {i + 1}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                         ) : (
                             <div className="max-w-xl mx-auto p-12 text-center glass-card rounded-[3rem]">
                                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-float">
                                      <Check className="text-white w-12 h-12" />
                                  </div>
                                  <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Merge Complete!</h2>
                                  <p className="text-muted-foreground mb-10 text-lg">Your combined document is ready for download.</p>
                                  
                                  <div className="flex flex-col gap-4">
                                      <a href={result.downloadUrl} download={result.filename} className="w-full">
                                          <Button className="w-full h-16 bg-white text-black font-black text-xl hover:bg-slate-200 rounded-2xl shadow-xl transition-transform hover:scale-105">
                                              <Download className="mr-2" size={24} /> Download PDF
                                          </Button>
                                      </a>
                                      <Button variant="ghost" onClick={() => { setStep(0); setResult(null); setFiles([]); setPages([]); }} className="text-muted-foreground hover:text-white hover:bg-white/5 h-12 rounded-xl">
                                          Merge Another File
                                      </Button>
                                  </div>
                             </div>
                         )}
                      </motion.div>
                  )}
             </AnimatePresence>
         </div>
    </div>
  )
}
