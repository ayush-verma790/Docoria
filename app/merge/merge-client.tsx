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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
         <SiteHeader />
         <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen"></div>
         </div>
         <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-12">
             <div className="flex items-center justify-between mb-8">
                  <div>
                      <h1 className="text-3xl font-bold mb-2">Combine PDFs</h1>
                      <p className="text-muted-foreground">Join different PDF files together and change their page order easily.</p>
                  </div>
                {step === 1 && !result && (
                    <div className="flex gap-2">
                         <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep(0)}>
                             Add more files
                         </Button>
                         <Button 
                            className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 max-w-2xl mx-auto"
                      >
                          <Card className="p-8 bg-card/50 border-border backdrop-blur-md">
                              <FileUploader onFileSelect={handleFilesSelected} accept=".pdf" multiple />
                          </Card>
                          {files.length > 0 && (
                              <Card className="p-4 bg-card border-border divide-y divide-border">
                                  {files.map((file, i) => (
                                      <div key={i} className="flex items-center justify-between py-3 px-2">
                                          <div className="flex items-center gap-3">
                                              <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${COLORS[i % COLORS.length]}`}>
                                                  {i + 1}
                                              </div>
                                              <div className="text-sm font-medium text-foreground">{file.name}</div>
                                              <div className="text-xs text-muted-foreground">{(file.size/1024/1024).toFixed(1)}MB</div>
                                          </div>
                                          <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400 p-2">
                                              <X size={16} />
                                          </button>
                                      </div>
                                  ))}
                                  <div className="pt-4 px-2">
                                      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
                                      <Button className="w-full bg-primary hover:bg-primary/90 font-bold" onClick={preparePages} disabled={isProcessing}>
                                          {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                                          Next: Organize Pages
                                      </Button>
                                  </div>
                              </Card>
                          )}
                      </motion.div>
                  )}
                  {step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
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
                                          "group relative space-y-2 cursor-grab active:cursor-grabbing transition-all",
                                          draggedIndex === i ? "opacity-30 scale-95" : "opacity-100"
                                      )}
                                  >
                                      <div className="relative aspect-[3/4] bg-card border border-border rounded-lg overflow-hidden group-hover:border-primary/50 group-hover:shadow-[0_0_20px_var(--color-primary)] transition-all">
                                          <div className="absolute top-2 left-2 z-10">
                                               <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${COLORS[page.fileIndex % COLORS.length]}`}>
                                                   {page.fileIndex + 1}
                                               </div>
                                          </div>
                                          <Document file={fileUrls[page.fileIndex]} className="w-full h-full scale-[0.6] origin-top">
                                              <Page 
                                                pageNumber={page.pageIndex + 1} 
                                                rotate={page.rotation} 
                                                width={200} 
                                                renderTextLayer={false} 
                                                renderAnnotationLayer={false}
                                                loading={<div className="w-full h-full bg-muted animate-pulse" />}
                                              />
                                          </Document>
                                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => rotatePage(i)} className="p-1.5 bg-white/10 hover:bg-primary rounded-md transition-colors"><RotateCw size={14} className="text-white" /></button>
                                              <button onClick={() => deletePage(i)} className="p-1.5 bg-white/10 hover:bg-destructive rounded-md transition-colors"><Trash2 size={14} className="text-white" /></button>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-center gap-2">
                                          <GripVertical size={12} className="text-muted-foreground group-hover:text-primary" />
                                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">Page {i + 1}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                         ) : (
                             <Card className="max-w-xl mx-auto p-12 text-center bg-card border-border backdrop-blur-xl">
                                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                      <Check className="text-emerald-400 w-10 h-10" />
                                  </div>
                                  <h2 className="text-2xl font-bold mb-2">PDFs Combined!</h2>
                                  <p className="text-muted-foreground mb-8 font-medium">Your new documents is ready for download.</p>
                                  <div className="flex gap-4">
                                      <a href={result.downloadUrl} download={result.filename} className="flex-1">
                                          <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                                              <Download className="mr-2" size={18} /> Download PDF
                                          </Button>
                                      </a>
                                      <Button variant="outline" onClick={() => { setStep(0); setResult(null); setFiles([]); setPages([]); }} className="flex-1 border-border hover:bg-accent hover:text-accent-foreground">
                                          Start New
                                      </Button>
                                  </div>
                             </Card>
                         )}
                      </motion.div>
                  )}
             </AnimatePresence>
         </div>
    </div>
  )
}
