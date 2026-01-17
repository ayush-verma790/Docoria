"use client"

import { useState, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Tag, Check, User, FileType, Search, PenTool, LayoutTemplate, Calendar } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

export default function MetadataClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Metadata Fields
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [subject, setSubject] = useState("")
  const [keywords, setKeywords] = useState("")
  const [creator, setCreator] = useState("")
  const [producer, setProducer] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  // Load initial metadata when file is selected
  useEffect(() => {
      if (!file) {
          setTitle("")
          setAuthor("")
          setSubject("")
          setKeywords("")
          setCreator("")
          setProducer("")
          return
      }
      
      const loadMetadata = async () => {
          try {
              const arrayBuffer = await file.arrayBuffer()
              const pdfDoc = await PDFDocument.load(arrayBuffer)
              
              setTitle(pdfDoc.getTitle() || "")
              setAuthor(pdfDoc.getAuthor() || "")
              setSubject(pdfDoc.getSubject() || "")
              setKeywords(pdfDoc.getKeywords() || "")
              setCreator(pdfDoc.getCreator() || "")
              setProducer(pdfDoc.getProducer() || "")
          } catch (e) {
              console.error("Failed to read metadata", e)
          }
      }
      loadMetadata()
  }, [file])

  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        pdfDoc.setTitle(title)
        pdfDoc.setAuthor(author)
        pdfDoc.setSubject(subject)
        pdfDoc.setKeywords(keywords.split(',').map(k => k.trim())) // pdf-lib usually takes array for setValues but simpler methods take string. Actually specific setters exist.

        // pdf-lib specific setters
        pdfDoc.setTitle(title)
        pdfDoc.setAuthor(author)
        pdfDoc.setSubject(subject)
        pdfDoc.setKeywords(keywords.split(/[;,]/).map(s => s.trim()))
        pdfDoc.setCreator(creator)
        pdfDoc.setProducer(producer)
        
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        setResult({
            downloadUrl: url,
            filename: `metadata-${file.name}`
        })
    } catch (err) {
        console.error(err)
        alert("Failed to update metadata. Please try again.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05010d] text-white selection:bg-purple-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                     <Tag className="w-4 h-4" />
                     <span>Metadata Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                     File <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Identity</span>
                 </h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                     View and modify hidden PDF properties. SEO optimization for documents.
                 </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                 
                 {/* LEFT: FILE UPLOAD */}
                 <div className="lg:col-span-4 space-y-6">
                     <Card className="p-1 bg-gradient-to-br from-white/10 to-transparent border-white/5 rounded-[2rem] shadow-2xl overflow-hidden sticky top-32">
                        <div className="bg-[#0A0A0F] p-8 rounded-[1.9rem] flex flex-col items-center justify-center border border-white/5 relative">
                             {!file ? (
                                 <div className="w-full">
                                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                 </div>
                             ) : (
                                 <div className="w-full space-y-6 text-center">
                                     <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400 mb-4 animate-in zoom-in-50 duration-500">
                                         <FileType size={40} />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-xl truncate px-4">{file.name}</h3>
                                         <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                     </div>
                                     <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => { setFile(null); setResult(null); }}>Change File</Button>
                                 </div>
                             )}
                        </div>
                     </Card>
                 </div>
                 
                 {/* RIGHT: FORM */}
                 <div className="lg:col-span-8">
                     <Card className="bg-[#0A0A0F]/80 backdrop-blur-md border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                         {!result ? (
                             <div className={!file ? "opacity-30 pointer-events-none grayscale transition-all duration-500" : "transition-all duration-500 opacity-100"}>
                                 <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                     <div className="space-y-3 col-span-2">
                                         <label className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                                             <PenTool size={14} /> Title
                                         </label>
                                         <Input 
                                            value={title} 
                                            onChange={e => setTitle(e.target.value)} 
                                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-purple-500 text-lg px-4" 
                                            placeholder="Document Title" 
                                         />
                                     </div>

                                     <div className="space-y-3">
                                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                             <User size={14} /> Author
                                         </label>
                                         <Input 
                                            value={author} 
                                            onChange={e => setAuthor(e.target.value)} 
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-purple-500" 
                                            placeholder="Author Name" 
                                         />
                                     </div>

                                     <div className="space-y-3">
                                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                             <LayoutTemplate size={14} /> Subject
                                         </label>
                                         <Input 
                                            value={subject} 
                                            onChange={e => setSubject(e.target.value)} 
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-purple-500" 
                                            placeholder="Subject / Description" 
                                         />
                                     </div>

                                     <div className="space-y-3 col-span-2">
                                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                             <Search size={14} /> Keywords (Separated by commas)
                                         </label>
                                         <Input 
                                            value={keywords} 
                                            onChange={e => setKeywords(e.target.value)} 
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-purple-500" 
                                            placeholder="invoice, 2024, finance, report" 
                                         />
                                     </div>

                                     <div className="space-y-3">
                                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                             Creator Application
                                         </label>
                                         <Input 
                                            value={creator} 
                                            onChange={e => setCreator(e.target.value)} 
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-purple-500" 
                                         />
                                     </div>

                                     <div className="space-y-3">
                                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                             Producer
                                         </label>
                                         <Input 
                                            value={producer} 
                                            onChange={e => setProducer(e.target.value)} 
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-purple-500" 
                                         />
                                     </div>
                                 </div>

                                 <Button 
                                    onClick={handleApply} 
                                    disabled={!file || isProcessing} 
                                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-lg rounded-2xl shadow-[0_10px_40px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                 >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Save Metadata"}
                                 </Button>
                             </div>
                         ) : (
                             <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                      <Check className="w-12 h-12 text-emerald-400" strokeWidth={3} />
                                  </div>
                                  <div>
                                      <h3 className="text-3xl font-black text-white mb-2">Updated!</h3>
                                      <p className="text-gray-400">File properties have been successfully saved.</p>
                                  </div>
                                  <a href={result.downloadUrl} download={result.filename}>
                                      <Button className="w-full h-14 bg-white text-purple-950 font-black text-lg hover:bg-emerald-50 rounded-xl shadow-xl">
                                          <Download className="mr-2" strokeWidth={3} /> Download PDF
                                      </Button>
                                  </a>
                                  <Button variant="ghost" onClick={() => {setResult(null); setFile(null); setTitle(""); setAuthor(""); setKeywords("")}} className="text-purple-400 hover:text-white">
                                      Edit Another
                                  </Button>
                             </div>
                         )}
                     </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}
