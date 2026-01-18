"use client"

import { useState, useCallback, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Layers, RotateCw, Trash2, ArrowRight, ArrowLeft, GripVertical, Check, Plus, X, ArrowUpDown, ArrowDownZA, ArrowDownAZ, LayoutGrid, List as ListIcon, Maximize2, RefreshCcw } from "lucide-react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { PDFDocument, degrees } from "pdf-lib"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { NextActionGrid } from "@/components/next-action-grid"

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
  const [mergedFile, setMergedFile] = useState<File | null>(null) // To pass to next tools
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove))
  }

  const [fileUrls, setFileUrls] = useState<Record<number, string>>({})

  // Sorting and Bulk Actions for Step 1
  const sortFilesByName = () => {
      setFiles(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)))
  }
  
  const sortFilesBySize = () => {
      setFiles(prev => [...prev].sort((a, b) => b.size - a.size))
  }

  const reverseFiles = () => {
      setFiles(prev => [...prev].reverse())
  }

  const clearAllFiles = () => {
      setFiles([])
      setError("")
  }

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

  // Drag Logic
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

  // Step 2 Actions
  const rotatePage = (index: number) => {
      const newPages = [...pages]
      newPages[index].rotation = (newPages[index].rotation + 90) % 360
      setPages(newPages)
  }

  const deletePage = (index: number) => {
      if (pages.length <= 1) return
      setPages(prev => prev.filter((_, i) => i !== index))
  }

  const reversePages = () => {
      setPages(prev => [...prev].reverse())
  }
  
  const resetPageOrder = () => {
       // Re-generate step 1 logic ideally, but for now we just regenerate linear based on files
       // Actually simpler to just warn user or reload, but let's just reverse for now as the main power feature
       // To properly reset, we'd need to store initial state.
       // Let's implement 'Shuffle' instead or just stick to Reverse
       preparePages() 
  }

  // Client-Side Merge Logic
  const handleMerge = async () => {
      if (files.length === 0 || pages.length === 0) return
      setIsProcessing(true)
      
      try {
          // 1. Load all source PDFs
          const pdfDocs = await Promise.all(
              files.map(async (file) => {
                  const buffer = await file.arrayBuffer()
                  return await PDFDocument.load(buffer)
              })
          )

          // 2. Create new document
          const mergedDoc = await PDFDocument.create()

          // 3. Process pages in order
          // We need to group pages by source file to minimize copyPages calls (optimization)
          // But since order is arbitrary, we might copy one by one. pdf-lib handles this okay.
          
          for (const pageItem of pages) {
              const sourceDoc = pdfDocs[pageItem.fileIndex]
              // copyPages returns an array of copied pages
              const [copiedPage] = await mergedDoc.copyPages(sourceDoc, [pageItem.pageIndex])
              
              if (pageItem.rotation !== 0) {
                  const existingRotation = copiedPage.getRotation().angle
                  copiedPage.setRotation(degrees(existingRotation + pageItem.rotation))
              }
              
              mergedDoc.addPage(copiedPage)
          }

          // 4. Save and Download
          const pdfBytes = await mergedDoc.save()
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const filename = `merged-document-${Date.now()}.pdf`
          
          setResult({
              downloadUrl: url,
              filename
          })
          
          // Create File object for next steps
          const newFile = new File([blob], filename, { type: 'application/pdf' })
          setMergedFile(newFile)

      } catch (err) {
          console.error(err)
          setError("Failed to merge documents. Please try again.")
      } finally {
          setIsProcessing(false)
      }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 selection:text-white font-sans">
         <SiteHeader />
         <TooltipProvider>
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-indigo-500/30 text-xs font-bold text-indigo-400 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        >
                            <Layers size={14} /> <span>PDF Merge Studio</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                            Combine <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PDFs</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl font-medium leading-relaxed">
                            Professional tool to join, organize, and merge multiple PDF documents. secure, private, and powerful.
                        </p>
                    </div>

                    {step === 1 && !result && (
                        <div className="flex items-center gap-4 animate-in slide-in-from-right fade-in duration-500">
                             <Button variant="ghost" onClick={() => setStep(0)} className="text-muted-foreground hover:text-white">
                                 <Plus className="mr-2" size={16} /> Add More
                             </Button>
                             <Button 
                                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
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
                    {/* STEP 1: FILE SELECTION */}
                    {step === 0 && (
                        <motion.div 
                            key="step0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8 max-w-4xl mx-auto"
                        >
                            <div className="p-1.5 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/0 shadow-2xl">
                                <div className="p-10 rounded-[2.3rem] bg-[#0A0A0F] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                    <FileUploader onFileSelect={handleFilesSelected} accept=".pdf" multiple />
                                </div>
                            </div>
                            
                            {files.length > 0 && (
                                <div className="space-y-4">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                            {files.length} Files Selected
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={sortFilesByName} className="h-8 hover:bg-white/10"><ArrowDownAZ size={16} /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Sort by Name</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={sortFilesBySize} className="h-8 hover:bg-white/10"><ArrowUpDown size={16} /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Sort by Size</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={reverseFiles} className="h-8 hover:bg-white/10"><RefreshCcw size={16} /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Reverse Order</TooltipContent>
                                            </Tooltip>
                                            <div className="w-px h-4 bg-white/10 mx-2" />
                                            <Button variant="ghost" size="sm" onClick={clearAllFiles} className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20">Clear All</Button>
                                        </div>
                                    </div>

                                    {/* File List */}
                                    <div className="space-y-2">
                                        {files.map((file, i) => (
                                            <motion.div 
                                                key={`${file.name}-${i}`}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group hover:bg-white/[0.07]"
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shrink-0 ${COLORS[i % COLORS.length]}`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white group-hover:text-indigo-200 transition-colors truncate text-lg">{file.name}</div>
                                                        <div className="text-xs text-gray-400 font-mono">{(file.size/1024/1024).toFixed(2)} MB</div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="pt-8">
                                        {error && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-200 mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>{error}
                                            </motion.div>
                                        )}
                                        <Button 
                                            className="w-full h-16 bg-white text-black hover:bg-indigo-50 font-bold text-xl rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-[1.01]" 
                                            onClick={preparePages} 
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin mr-3" /> : <ArrowRight className="mr-3" />}
                                            Next Step: Organize
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: PAGE ORGANIZATION */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                           {!result ? (
                            <div className="space-y-6">
                                {/* Tools */}
                                <div className="flex justify-between items-center px-2">
                                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Drag & Drop to reorder pages
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" onClick={reversePages} className="rounded-lg text-xs font-bold">
                                            <RefreshCcw className="mr-2" size={12} /> Reverse All
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={resetPageOrder} className="rounded-lg text-xs font-bold border-white/10 hover:bg-white/5">
                                            Reset
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                                    {pages.map((page, i) => (
                                        <div 
                                            key={page.id}
                                            draggable
                                            onDragStart={() => handleDragStart(i)}
                                            onDragOver={(e) => handleDragOver(e, i)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                "group relative cursor-grab active:cursor-grabbing transition-all hover:z-20",
                                                draggedIndex === i ? "opacity-30 scale-95" : "opacity-100 hover:scale-105"
                                            )}
                                        >
                                            <div className="aspect-[3/4] bg-[#1a1a20] rounded-xl overflow-hidden border border-white/5 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all relative">
                                                {/* Page Number Badge */}
                                                <div className="absolute top-2 left-2 z-10">
                                                     <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-lg ${COLORS[page.fileIndex % COLORS.length]}`}>
                                                         File {page.fileIndex + 1}
                                                     </div>
                                                </div>
                                                
                                                <Document file={fileUrls[page.fileIndex]} className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-white/5">
                                                    <Page 
                                                      pageNumber={page.pageIndex + 1} 
                                                      rotate={page.rotation} 
                                                      width={180} 
                                                      renderTextLayer={false} 
                                                      renderAnnotationLayer={false}
                                                      loading={<Loader2 className="animate-spin text-white/20" />}
                                                    />
                                                </Document>

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => rotatePage(i)} className="p-2 bg-white/10 hover:bg-indigo-600 rounded-lg transition-colors border border-white/10" title="Rotate"><RotateCw size={16} className="text-white" /></button>
                                                        <button onClick={() => deletePage(i)} className="p-2 bg-white/10 hover:bg-red-500 rounded-lg transition-colors border border-white/10" title="Delete"><Trash2 size={16} className="text-white" /></button>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Page {i + 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Bottom Action Bar for Easy Access */}
                                <div className="flex flex-col items-center justify-center pb-20 space-y-6">
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-200 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center flex items-center justify-center gap-2">
                                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>{error}
                                        </motion.div>
                                    )}
                                    <Button 
                                        className="h-20 px-12 rounded-2xl bg-white text-black text-xl font-black hover:bg-indigo-50 shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] border border-white/20"
                                        onClick={handleMerge}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin mr-3 w-8 h-8" /> : <Download className="mr-3 w-8 h-8" />}
                                        Merge & Download PDF
                                    </Button>
                                    <p className="text-muted-foreground text-sm">Ready to combine {pages.length} pages into one document.</p>
                                </div>
                            </div>
                           ) : (
                               <div className="max-w-xl mx-auto p-12 text-center relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-[3rem] blur-3xl -z-10"></div>
                                    <div className="glass-card rounded-[3rem] p-12 border border-white/10 shadow-2xl">
                                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-float">
                                            <Check className="text-white w-12 h-12" />
                                        </div>
                                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Merge Complete!</h2>
                                        <p className="text-muted-foreground mb-10 text-lg">Your Document is ready.</p>
                                        
                                        <div className="space-y-4">
                                            <a href={result.downloadUrl} download={result.filename} className="w-full block">
                                                <Button className="w-full h-16 bg-white text-black font-black text-xl hover:bg-slate-200 rounded-2xl shadow-xl transition-transform hover:scale-105">
                                                    <Download className="mr-2" size={24} /> Download PDF
                                                </Button>
                                            </a>
                                            <Button variant="ghost" onClick={() => { setStep(0); setResult(null); setFiles([]); setPages([]); }} className="text-indigo-300 hover:text-white hover:bg-indigo-500/10 h-12 rounded-xl w-full">
                                                Start Over
                                            </Button>
                                        </div>

                                        <NextActionGrid file={mergedFile} />
                                    </div>
                               </div>
                           )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
         </TooltipProvider>
    </div>
  )
}
