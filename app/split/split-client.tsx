"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { PDFDocument } from "pdf-lib"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Scissors, Check, FileText, Upload, X, MousePointer2 } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function SplitClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set()) 
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    // By default, select nothing or all? Let's select none to encourage selection
    setSelectedPages(new Set())
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
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        const srcDoc = await PDFDocument.load(arrayBuffer)
        const newDoc = await PDFDocument.create()
        
        // Sort pages to ensure they are in order of the original doc
        const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b)
        
        // copyPages returns an array of copied pages
        // We must pass the indices (0-based) to copyPages
        const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices)
        
        for (const page of copiedPages) {
            newDoc.addPage(page)
        }
        
        const pdfBytes = await newDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        setResult({
            downloadUrl: url,
            filename: `extracted-pages-${Date.now()}.pdf`
        })

    } catch (err) {
      console.error(err)
      alert("Failed to split PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-cyan-500/30 selection:text-white font-sans overflow-hidden">
      <SiteHeader />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12 pb-32">
        <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <Scissors className="w-4 h-4" />
                <span>PDF Splitter Studio</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white">Extract Pages <span className="text-cyan-500">Instantly</span></h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Secure client-side extraction. No uploads, no waiting.
            </p>
        </div>

        {!file ? (
           <div className="max-w-2xl mx-auto p-12 rounded-[3.5rem] relative overflow-hidden group bg-[#0A0A0F]/60 border border-white/5 backdrop-blur-xl shadow-2xl hover:border-cyan-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10">
                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                </div>
           </div>
        ) : !result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="sticky top-24 z-40 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 ring-1 ring-cyan-500/30">
                              <FileText size={24} />
                          </div>
                          <div>
                              <div className="font-bold text-white truncate max-w-[200px]">{file.name}</div>
                              <div className="text-sm text-gray-400">{selectedPages.size} of {numPages} pages selected</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl" onClick={() => setSelectedPages(new Set())}>Unselect All</Button>
                          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl" onClick={() => setSelectedPages(new Set(Array.from({length: numPages}, (_, i) => i)))}>Select All</Button>
                      </div>
                  </div>
                  
                  <div className="bg-[#0A0A0F]/60 border border-white/5 backdrop-blur-md p-8 rounded-[2rem]">
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
                                            opacity: 1, 
                                            scale: isSelected ? 1 : 0.95,
                                            y: isSelected ? 0 : 5
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => togglePage(index)}
                                        className={`relative cursor-pointer group`}
                                    >
                                        <div className={`relative rounded-xl overflow-hidden transition-all duration-300 bg-[#1A1A23] ${isSelected ? 'ring-2 ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.25)]' : 'ring-1 ring-white/10 hover:ring-white/30'}`}>
                                            <div className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-cyan-500 text-black scale-100 shadow-lg' : 'bg-black/50 text-transparent scale-75 opacity-0'}`}>
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                            
                                            <div className={cn("transition-all duration-300", !isSelected && "opacity-50 grayscale")}>
                                                <Page
                                                    pageNumber={index + 1}
                                                    width={200}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    className="mix-blend-normal object-cover"
                                                />
                                            </div>
                                            
                                            <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm text-gray-300 text-[10px] text-center py-2 font-bold tracking-widest uppercase border-t border-white/5">
                                                Page {index + 1}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </Document>
                  </div>
            </div>
        ) : (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8 bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95">
                <div className="w-24 h-24 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                    <Scissors className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="space-y-4">
                        <h3 className="text-4xl font-black text-white">Extraction Complete!</h3>
                        <p className="text-xl text-gray-400 font-light">Your new PDF with {selectedPages.size} pages is ready.</p>
                </div>
                <div className="flex flex-col gap-4 pt-6">
                        <a href={result.downloadUrl} download={result.filename} className="w-full">
                        <Button className="w-full h-16 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all hover:scale-105">
                            <Download className="mr-3" strokeWidth={3} /> Download File
                        </Button>
                        </a>
                        <Button 
                        variant="ghost"
                        onClick={() => { setResult(null); setFile(null); setSelectedPages(new Set()); }}
                        className="h-14 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5"
                        >
                        Split Another File
                        </Button>
                </div>
            </div>
        )}
      </div>

      <AnimatePresence>
          {file && !result && (
              <motion.div 
                 initial={{ y: 100, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: 100, opacity: 0 }}
                 className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
              >
                  <div className="bg-[#1A1A23] border border-white/10 shadow-2xl rounded-2xl p-3 pl-6 pr-3 flex items-center gap-6 pointer-events-auto">
                       <div className="text-sm font-bold text-white hidden sm:block">
                           <span className="text-cyan-400">{selectedPages.size}</span> pages selected
                       </div>
                       <Button 
                          onClick={handleProcess}
                          disabled={selectedPages.size === 0 || isProcessing}
                          className="h-14 px-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-all"
                       >
                           {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Scissors className="mr-2 w-5 h-5 fill-black" />}
                           {isProcessing ? "Processing..." : "Extract Pages"}
                       </Button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
