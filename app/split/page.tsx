"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Scissors, Check, FileText, Upload, X, MousePointer2 } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set()) // 0-indexed indices
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [error, setError] = useState("")

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    // By default, select all? Or select none? Let's select ALL so they can remove what they don't want (common split use case: "remove page 2")
    // Actually, "Split" usually means "Extract specific pages". Let's start with NONE selected so they pick what they want.
    // Wait, "Split" implies putting it apart. "Extract" implies taking some out.
    // Let's go with "Select pages to keep". It's intuitive.
    // Start with ALL selected (Keep mode) is safer from UX perspective (I want to keep everything except page X).
    const all = new Set(Array.from({ length: numPages }, (_, i) => i)) // 0-indexed indices for logic
    setSelectedPages(all)
  }

  const togglePage = (index: number) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedPages(newSelected)
  }

  const handleProcess = async () => {
    if (!file || selectedPages.size === 0) return

    setIsProcessing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      // Sort indices
      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b)
      formData.append("pages", sortedIndices.join(","))

      const res = await fetch("/api/split", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Split failed")

      setResult(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      <SiteHeader />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-12 pb-32">
        
        {/* Header */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-6">
                <Scissors className="w-4 h-4" />
                <span>Take Pages Out</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Pick the Pages You Want</h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Click on the pages you want to keep. Only the pages you select will be saved to your new file.
            </p>
        </div>

        {!file ? (
           <Card className="max-w-xl mx-auto p-10 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
           </Card>
        ) : !result ? (
            <div className="space-y-8">
                 <div className="sticky top-4 z-40 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-2xl">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                              <FileText size={20} />
                          </div>
                          <div>
                              <div className="font-medium text-white truncate max-w-[200px]">{file.name}</div>
                              <div className="text-xs text-slate-400">{selectedPages.size} of {numPages} pages selected</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setSelectedPages(new Set())}>Unselect All</Button>
                          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setSelectedPages(new Set(Array.from({length: numPages}, (_, i) => i)))}>Select All</Button>
                      </div>
                 </div>

                 <Document 
                    file={file} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                 >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({length: numPages}, (_, index) => {
                             const isSelected = selectedPages.has(index)
                             return (
                                 <motion.div 
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ 
                                        opacity: isSelected ? 1 : 0.4, 
                                        scale: isSelected ? 1 : 0.95,
                                        filter: isSelected ? "grayscale(0%)" : "grayscale(100%)"
                                    }}
                                    onClick={() => togglePage(index)}
                                    className={`relative cursor-pointer group`}
                                 >
                                     <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'ring-1 ring-white/10'}`}>
                                         {/* Checkmark Overlay */}
                                         <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-cyan-500 text-white scale-100' : 'bg-black/50 text-transparent scale-90'}`}>
                                             <Check size={14} />
                                         </div>
                                         
                                         {/* Click Overlay (Hover) */}
                                         <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors z-[5]"></div>

                                         <div className="pointer-events-none bg-white">
                                            <Page
                                                pageNumber={index + 1}
                                                width={200}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                         </div>
                                         
                                         <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-1 font-mono">
                                             Page {index + 1}
                                         </div>
                                     </div>
                                 </motion.div>
                             )
                        })}
                    </div>
                 </Document>
            </div>
        ) : (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8">
                <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]">
                    <Scissors className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white">Extraction Complete!</h3>
                        <p className="text-slate-400">We've created a new PDF with your {selectedPages.size} selected pages.</p>
                </div>
                
                <div className="flex justify-center gap-4">
                        <a href={result.downloadUrl} download={result.filename}>
                        <Button className="h-14 px-8 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg shadow-lg">
                            <Download className="mr-2" /> Download File
                        </Button>
                        </a>
                        <Button 
                        variant="outline"
                        onClick={() => { setResult(null); setFile(null); }}
                        className="h-14 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                        Split Another
                        </Button>
                </div>
            </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
          {file && !result && (
              <motion.div 
                 initial={{ y: 100 }}
                 animate={{ y: 0 }}
                 exit={{ y: 100 }}
                 className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6"
              >
                  <div className="bg-slate-900 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex items-center gap-6 backdrop-blur-xl">
                       <div className="text-sm font-medium text-slate-300 hidden sm:block">
                           {selectedPages.size} pages selected
                       </div>
                       <Button 
                          onClick={handleProcess}
                          disabled={selectedPages.size === 0 || isProcessing}
                          className="h-12 px-8 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:shadow-none"
                       >
                           {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Scissors className="mr-2 w-5 h-5" />}
                           {isProcessing ? "Processing..." : "Extract Pages"}
                       </Button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
