"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, ArrowLeft, RotateCw, Trash2, GripVertical, Sparkles, FileText, Upload, Check } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { cn } from "@/lib/utils"

export default function OrganizeClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null)
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageOrder(Array.from({ length: numPages }, (_, i) => i + 1))
  }

  const movePage = (fromIndex: number, toIndex: number) => {
    const newOrder = [...pageOrder]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setPageOrder(newOrder)
  }

  const rotatePage = (originalPageNum: number) => {
    setRotations(prev => ({
      ...prev,
      [originalPageNum]: ((prev[originalPageNum] || 0) + 90) % 360
    }))
  }

  const deletePage = (indexToRemove: number) => {
    if (pageOrder.length <= 1) {
      alert("Cannot delete the last page")
      return
    }
    const newOrder = pageOrder.filter((_, i) => i !== indexToRemove)
    setPageOrder(newOrder)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    movePage(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("pageOrder", JSON.stringify(pageOrder))
      formData.append("rotations", JSON.stringify(rotations))
      formData.append("signature", "placeholder")
      formData.append("positions", JSON.stringify([]))
      formData.append("textEdits", JSON.stringify([]))
      const res = await fetch("/api/sign", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col font-sans selection:bg-purple-500/30 selection:text-white pt-20">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="sticky top-20 z-40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
             <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4 border-white/10 shadow-xl backdrop-blur-3xl">
                <div className="flex items-center gap-4 overflow-hidden">
                  <button 
                    onClick={() => window.history.back()}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 text-white/70 hover:text-white"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Editor Mode</span>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                  <div className="min-w-0 hidden sm:block">
                    <h1 className="text-lg font-bold text-white truncate leading-tight">Organize Pages</h1>
                    <p className="text-xs text-muted-foreground truncate">Reorder, rotate, and manage your PDF</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {file && !result && (
                    <Button
                      onClick={handleProcess}
                      disabled={!file || isProcessing}
                      className="bg-white text-black hover:bg-purple-50 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 cursor-pointer h-12 px-6 rounded-xl font-bold"
                    >
                      {isProcessing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /><span>Saving...</span></>
                      ) : (
                        <><Check className="mr-2 h-4 w-4" /><span>Save Changes</span></>
                      )}
                    </Button>
                  )}
                  {result && (
                    <>
                      <a href={result.downloadUrl} download>
                        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black h-12 px-6 rounded-xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105">
                          <Download className="mr-2 h-4 w-4" /><span>Download PDF</span>
                        </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        onClick={() => { setResult(null); setFile(null); setPageOrder([]) }}
                        className="h-12 px-6 rounded-xl text-white hover:bg-white/10"
                      >
                        <span>New Document</span>
                      </Button>
                    </>
                  )}
                </div>
             </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!file ? (
          <div className="flex items-center justify-center min-h-[60vh]">
             <div className="glass-card p-12 rounded-[3.5rem] max-w-2xl w-full text-center relative overflow-hidden group border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-white/10">
                      <Upload className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Upload Your PDF</h2>
                  <p className="text-lg text-muted-foreground mb-10 font-light">Select a PDF file to reorder, rotate, or remove pages.</p>
                  
                  <div className="relative z-10">
                      <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                  </div>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-white/5">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                  <FileText className="w-6 h-6 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{file.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-purple-200 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {pageOrder.length} pages
                    </span>
                    <span className="text-xs text-muted-foreground">Drag to verify order</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl" onClick={() => { setFile(null); setResult(null); setPageOrder([]) }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Discard
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-black/20 min-h-[500px]">
                <Document 
                  file={file} 
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="w-full"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {pageOrder.map((originalPageNum, index) => (
                      <div
                        key={`page-${index}-${originalPageNum}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "group relative bg-white/5 rounded-2xl border transition-all duration-300 overflow-hidden",
                          draggedIndex === index ? "opacity-30 scale-95 border-purple-500 ring-2 ring-purple-500/50 grayscale" : "hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-white/5 hover:border-purple-500/50 hover:-translate-y-1",
                          "cursor-grab active:cursor-grabbing"
                        )}
                      >
                        <div className="absolute top-3 left-3 z-30 pointer-events-none">
                          <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg border border-white/10">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="aspect-[3/4] flex items-center justify-center p-3 bg-white/5 overflow-hidden transition-colors group-hover:bg-white/10">
                          <Page
                            pageNumber={originalPageNum}
                            width={180}
                            rotate={rotations[originalPageNum] || 0}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity object-cover"
                            loading={<div className="w-full aspect-[3/4] bg-white/5 animate-pulse rounded-md" />}
                          />
                        </div>
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
                            <div className="flex items-center gap-2 justify-center pb-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); rotatePage(originalPageNum); }}
                                    className="p-2 bg-white/10 hover:bg-purple-500 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                                    title="Rotate 90°"
                                >
                                    <RotateCw size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deletePage(index); }}
                                    className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                                    title="Delete page"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
                           <GripVertical size={24} className="text-white/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
