"use client"

import { useState } from "react"
import { pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, FileText, Copy, Check, RefreshCw, AlignLeft, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Initialize worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function PdfToTextClient() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleExtract = async () => {
      if (!file) return
      setIsProcessing(true)
      setText("")
      setProgress(0)

      try {
          const buffer = await file.arrayBuffer()
          const loadingTask = pdfjs.getDocument(buffer)
          const doc = await loadingTask.promise
          const numPages = doc.numPages
          
          let fullText = ""

          for (let p = 1; p <= numPages; p++) {
              setProgress(Math.round((p / numPages) * 100))
              const page = await doc.getPage(p)
              const textContent = await page.getTextContent()
              
              // Simple text extraction: join items with space
              // More advanced would preserve layout logic, but this is "Extract Text"
              const pageText = textContent.items
                // @ts-ignore
                .map(item => item.str)
                .join(" ")
              
              fullText += `--- Page ${p} ---\n\n${pageText}\n\n`
          }
          
          setText(fullText)
      } catch (err) {
          console.error(err)
          alert("Failed to extract text. The PDF might be scanned/image-based (use OCR instead) or password protected.")
      } finally {
          setIsProcessing(false)
          setProgress(0)
      }
  }

  const handleCopy = () => {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${file?.name.replace('.pdf', '') || 'document'}.txt`
      a.click()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-teal-500/30">
        <SiteHeader />
        
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
             <div className="text-center mb-12 space-y-4">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 mb-6 shadow-[0_0_40px_rgba(20,184,166,0.2)]"
                  >
                      <FileText className="w-10 h-10 text-teal-400" />
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                      PDF to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Text</span>
                  </h1>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                      Extract editable text from native PDF documents. Fast and private.
                  </p>
             </div>

             <div className="grid lg:grid-cols-12 gap-8 flex-1">
                  
                  {/* Left Panel: Input */}
                  <div className="lg:col-span-4 space-y-6">
                      <Card className="p-1 bg-gradient-to-br from-white/10 to-white/0 rounded-[2.5rem] border-0 shadow-2xl">
                          <div className="bg-[#0A0A0F] rounded-[2.3rem] p-6 border border-white/5 space-y-6">
                               {!file ? (
                                   <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer relative group">
                                       <FileUploader onFileSelect={(f) => setFile(f[0])} accept=".pdf" />
                                       <div className="mt-4 text-sm text-slate-500 group-hover:text-teal-400 transition-colors font-bold">PDF Documents Only</div>
                                   </div>
                               ) : (
                                   <div className="space-y-6 text-center">
                                       <div className="mx-auto w-24 h-32 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 shadow-inner">
                                           <FileText className="text-teal-500 opacity-80" size={40} />
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-white truncate px-2">{file.name}</h3>
                                           <p className="text-xs text-slate-500 font-mono mt-1">{(file.size/1024).toFixed(1)} KB</p>
                                       </div>
                                       
                                       <div className="grid grid-cols-2 gap-3">
                                           <Button 
                                                onClick={() => { setFile(null); setText(""); }}
                                                variant="outline"
                                                className="border-white/10 hover:bg-white/5 hover:text-white"
                                            >
                                                <RefreshCw size={16} />
                                           </Button>
                                           <Button 
                                                onClick={handleExtract}
                                                disabled={isProcessing}
                                                className="bg-teal-600 hover:bg-teal-500 text-white font-bold col-span-1 shadow-lg shadow-teal-500/20"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : "Extract"}
                                            </Button>
                                       </div>

                                       <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 text-left leading-relaxed">
                                           <strong>Note:</strong> This tool extracts text from <em>native</em> PDFs. If your PDF is a scanned image, use the <span className="text-white underline decoration-blue-500/50">Scanner</span> tool instead.
                                       </div>
                                   </div>
                               )}
                          </div>
                      </Card>
                  </div>

                  {/* Right Panel: Output */}
                  <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                      <Card className="flex-1 bg-[#0A0A0F] border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden shadow-2xl">
                          <div className="flex items-center justify-between mb-6 relative z-10">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                      <AlignLeft className="text-teal-400" />
                                  </div>
                                  <h3 className="font-bold text-lg">Extracted Content</h3>
                              </div>
                              {text && (
                                  <div className="flex gap-2">
                                      <Button variant="secondary" onClick={handleCopy} className="rounded-xl h-10 gap-2">
                                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} 
                                          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                                      </Button>
                                      <Button onClick={handleDownload} className="rounded-xl h-10 bg-white text-black hover:bg-slate-200 font-bold gap-2">
                                          <Download size={16} /> <span className="hidden sm:inline">Save .txt</span>
                                      </Button>
                                  </div>
                              )}
                          </div>

                          <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                               {text ? (
                                   <textarea 
                                        className="w-full h-full bg-transparent p-6 resize-none focus:outline-none text-slate-300 font-mono text-sm leading-relaxed custom-scrollbar selection:bg-teal-500/30"
                                        value={text}
                                        readOnly
                                   />
                               ) : (
                                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                                       {isProcessing ? (
                                           <div className="text-center space-y-4">
                                               <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto" />
                                               <p className="font-bold animate-pulse">Extracting Text ({progress}%)...</p>
                                           </div>
                                       ) : (
                                           <>
                                               <Search size={48} className="mb-4" />
                                               <p>No text extracted yet</p>
                                           </>
                                       )}
                                   </div>
                               )}
                          </div>
                      </Card>
                  </div>
             </div>
        </div>
    </div>
  )
}
