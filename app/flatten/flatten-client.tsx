"use client"

import { useState, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Hammer, Check, Layers, AlertTriangle, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

import { NextActionGrid } from "@/components/next-action-grid"
import { getGlobalFile } from "@/lib/file-store"

export default function FlattenClient() {
  const [file, setFile] = useState<File | null>(null)
  
  useEffect(() => {
    const global = getGlobalFile()
    if (global.file) {
        setFile(global.file)
    }
  }, [])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [flattenedFile, setFlattenedFile] = useState<File | null>(null)
  
  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        try {
            const form = pdfDoc.getForm()
            form.flatten()
        } catch (e) {
            console.warn("No form found or flattening failed", e)
            alert("No fillable forms were found in this PDF to flatten.")
            setIsProcessing(false)
            return
        }

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const filename = `flattened-${file.name}`
        
        setResult({
            downloadUrl: url,
            filename
        })
        
        setFlattenedFile(new File([blob], filename, { type: 'application/pdf' }))
    } catch (err) {
        console.error(err)
        alert("Failed to process PDF. Please try again.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0505] text-white selection:bg-rose-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                     <Hammer className="w-4 h-4" />
                     <span>Flatten Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                     Lock <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">PDF Forms</span>
                 </h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                     Permanently merge form fields and annotations into the page content to prevent editing.
                 </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
             
                 {/* LEFT: FILE & STATUS */}
                 <div className="lg:col-span-5 space-y-6">
                     <Card className="p-1 bg-gradient-to-br from-white/10 to-transparent border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="bg-[#120303] p-8 rounded-[1.9rem] min-h-[400px] flex flex-col items-center justify-center border border-white/5 relative">
                             {!file ? (
                                 <div className="w-full">
                                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                 </div>
                             ) : (
                                 <div className="w-full space-y-6 text-center">
                                     <div className="w-20 h-20 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400 mb-4 animate-in zoom-in-50 duration-500">
                                         <Hammer size={40} />
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
                 
                 {/* RIGHT: ACTIONS */}
                 <div className="lg:col-span-7">
                     <Card className="bg-[#120303]/80 backdrop-blur-md border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                         {!result ? (
                             <div className="space-y-8 relative z-10">
                                 <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-4 items-start">
                                     <AlertTriangle className="text-orange-500 shrink-0 mt-1" />
                                     <div className="space-y-1">
                                         <h4 className="font-bold text-orange-400">Important Warning</h4>
                                         <p className="text-sm text-gray-400 leading-relaxed">
                                             Flattening will convert all interactive form fields (text boxes, checkboxes, dropdowns) into regular non-editable text and graphics. This action <strong>cannot be undone</strong>.
                                         </p>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
                                         <ShieldCheck className="mx-auto text-rose-400" />
                                         <h5 className="font-bold text-sm">Prevent Edits</h5>
                                         <p className="text-xs text-gray-500">Lock data integrity</p>
                                     </div>
                                     <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
                                         <Layers className="mx-auto text-rose-400" />
                                         <h5 className="font-bold text-sm">Merge Layers</h5>
                                         <p className="text-xs text-gray-500">Simplify document</p>
                                     </div>
                                 </div>

                                 <Button 
                                    onClick={handleApply} 
                                    disabled={!file || isProcessing}
                                    className="w-full h-16 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-lg rounded-2xl shadow-[0_10px_40px_rgba(225,29,72,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                 >
                                     {isProcessing ? (
                                         <><Loader2 className="animate-spin mr-2" /> Flattening PDF...</>
                                     ) : (
                                         <><Hammer className="mr-2" /> Flatten Document</>
                                     )}
                                 </Button>
                             </div>
                         ) : (
                             <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                  <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_40px_rgba(225,29,72,0.3)]">
                                      <Check className="w-12 h-12 text-rose-400" strokeWidth={3} />
                                  </div>
                                  <div>
                                      <h3 className="text-3xl font-black text-white mb-2">Flattened!</h3>
                                      <p className="text-gray-400">Your document is now locked and safe.</p>
                                  </div>
                                  
                                  <div className="flex flex-col gap-4">
                                      <a href={result.downloadUrl} download={result.filename} className="w-full">
                                          <Button className="w-full h-14 bg-white text-rose-950 font-black text-lg hover:bg-rose-50 rounded-xl shadow-xl">
                                              <Download className="mr-2" strokeWidth={3} /> Download PDF
                                          </Button>
                                      </a>
                                      <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}} className="text-gray-400 hover:text-white">
                                          Flatten Another
                                      </Button>
                                  </div>
                                  
                                  <NextActionGrid file={flattenedFile} />
                             </div>
                         )}
                     </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}
