"use client"

import { useState } from "react"
import { PDFDocument, PageSizes } from "pdf-lib"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Maximize, CheckCircle, ArrowRight, Smartphone, FileText, Monitor, Ruler, Instagram, Linkedin, Facebook } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function ResizeClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Size State
  const [mode, setMode] = useState<"standard" | "social" | "custom">("standard")
  const [preset, setPreset] = useState("a4")
  const [customWidth, setCustomWidth] = useState(210) // mm
  const [customHeight, setCustomHeight] = useState(297) // mm
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)

  const PRESETS = {
      // Standard (mm) [Converted to Points * 2.83465 inside function]
      'a4': { w: 210, h: 297, label: "A4", sub: "Standard Document" },
      'letter': { w: 215.9, h: 279.4, label: "US Letter", sub: "Standard US" },
      'legal': { w: 215.9, h: 355.6, label: "Legal", sub: "Long Document" },
      
      // Social - actually pixels, but we treat them as points roughly for PDF size (72dpi) or just unitless
      'insta-story': { w: 1080/4, h: 1920/4, label: "Insta Story", sub: "9:16 Vertical" },
      'linkedin-slide': { w: 1080/4, h: 1080/4, label: "LinkedIn", sub: "1:1 Square" },
      'presentation': { w: 1920/4, h: 1080/4, label: "16:9 Slide", sub: "Widescreen" }
  }

  const handleResize = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
        const arrayBuffer = await file.arrayBuffer()
        const srcDoc = await PDFDocument.load(arrayBuffer)
        const destDoc = await PDFDocument.create()
        
        // Determine target size in Points (1 mm = 2.83465 points)
        let targetW = 0
        let targetH = 0
        
        if (mode === 'custom') {
            targetW = customWidth * 2.83465
            targetH = customHeight * 2.83465
        } else {
            const p = PRESETS[preset as keyof typeof PRESETS]
            if (['insta-story', 'linkedin-slide', 'presentation'].includes(preset)) {
                 // For "screen" presets, values are roughly points already (scaled down for PDF)
                 targetW = p.w * 2 // boost quality slightly
                 targetH = p.h * 2
            } else {
                 // Standard formats are mm
                 targetW = p.w * 2.83465
                 targetH = p.h * 2.83465
            }
        }

        const pages = await destDoc.copyPages(srcDoc, srcDoc.getPageIndices())

        for (let i = 0; i < pages.length; i++) {
            // We need to embed the page to scale it?
            // Actually, copying pages preserves original size. We want to RESIZE.
            // Best way: Create NEW page of target size, EMBED original page into it, verify scaling.
            // Copying pages works, then we can scale the content? No, easy way is embedding.
        }
        
        // Re-approach: Iterate source, embed into new doc pages
        const newDoc = await PDFDocument.create()
        const embeddedPages = await newDoc.embedPages(srcDoc.getPages()) // This extracts them as XObjects? No, copyPages is separate.
        // Actually embedPages takes 'Page' objects from another doc to be used as Image-like drawables.
        
        // Correct logic:
        const range = srcDoc.getPageIndices()
        // We must embed pages one by one?
        // pdf-lib's `embedPage` is for embedding a page from ONE doc into ANOTHER.
        
        for (let i = 0; i < srcDoc.getPageCount(); i++) {
             const [embeddedPage] = await newDoc.embedPages([srcDoc.getPage(i)])
             const page = newDoc.addPage([targetW, targetH])
             
             // Calculate fitted dimensions (contain)
             const { width: srcW, height: srcH } = embeddedPage
             
             const scale = Math.min(targetW / srcW, targetH / srcH)
             const drawW = srcW * scale
             const drawH = srcH * scale
             
             // Center it
             const x = (targetW - drawW) / 2
             const y = (targetH - drawH) / 2
             
             page.drawPage(embeddedPage, {
                 x,
                 y,
                 width: drawW,
                 height: drawH
             })
        }

        const pdfBytes = await newDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setResult({
            downloadUrl: url,
            filename: `resized-${file.name}`
        })

    } catch (err) {
        console.error(err)
        alert("Resize failed")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#020817] text-white selection:bg-cyan-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] right-[20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                     <Maximize className="w-4 h-4" />
                     <span>Resize Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                     Scale <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Documents</span>
                 </h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                     Convert PDFs to A4, Letter, or social media formats. Smart scaling fits content perfectly.
                 </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                 
                 {/* LEFT: FILE */}
                 <div className="lg:col-span-5 space-y-6">
                     <Card className="p-1 bg-gradient-to-br from-white/10 to-transparent border-white/5 rounded-[2rem] shadow-2xl overflow-hidden sticky top-32">
                        <div className="bg-[#0B1221] p-8 rounded-[1.9rem] min-h-[400px] flex flex-col items-center justify-center border border-white/5 relative">
                             {!file ? (
                                 <div className="w-full">
                                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                 </div>
                             ) : (
                                 <div className="w-full space-y-6 text-center">
                                     <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 mb-4 animate-in zoom-in-50 duration-500">
                                         <Monitor size={40} />
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
                 
                 {/* RIGHT: CONTROLS */}
                 <div className="lg:col-span-7">
                     <Card className="bg-[#0B1221]/80 backdrop-blur-md border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                         {!result ? (
                             <div className="space-y-8 relative z-10">
                                 {/* TABS */}
                                 <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-6">
                                     {['standard', 'social', 'custom'].map((tab) => (
                                         <button 
                                            key={tab}
                                            onClick={() => setMode(tab as any)}
                                            className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all", mode === tab ? "bg-cyan-600 text-white shadow-lg" : "text-gray-500 hover:text-white")}
                                         >
                                             {tab}
                                         </button>
                                     ))}
                                 </div>

                                 {/* STANDARD PRESETS */}
                                 {mode === 'standard' && (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         {['a4', 'letter', 'legal'].map(id => {
                                             const p = PRESETS[id as keyof typeof PRESETS]
                                             return (
                                                 <button
                                                    key={id}
                                                    onClick={() => setPreset(id)}
                                                    className={cn("p-4 rounded-xl text-left border transition-all", preset === id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                                                 >
                                                     <div className="font-bold text-lg">{p.label}</div>
                                                     <div className="text-xs opacity-70 mb-1">{p.sub}</div>
                                                     <div className="text-[10px] font-mono opacity-50">{p.w} x {p.h} mm</div>
                                                 </button>
                                             )
                                         })}
                                     </div>
                                 )}

                                 {/* SOCIAL PRESETS */}
                                 {mode === 'social' && (
                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                         {[
                                             { id: 'insta-story', icon: Instagram },
                                             { id: 'linkedin-slide', icon: Linkedin },
                                             { id: 'presentation', icon: Monitor },
                                         ].map(item => {
                                              const p = PRESETS[item.id as keyof typeof PRESETS]
                                              return (
                                                 <button
                                                    key={item.id}
                                                    onClick={() => setPreset(item.id)}
                                                    className={cn("p-4 rounded-xl flex flex-col items-center justify-center gap-3 border transition-all aspect-square", preset === item.id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                                                 >
                                                     <item.icon size={24} />
                                                     <div className="font-bold text-sm text-center">{p.label}</div>
                                                 </button>
                                              )
                                         })}
                                     </div>
                                 )}

                                 {/* CUSTOM */}
                                 {mode === 'custom' && (
                                     <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 animate-in zoom-in-95">
                                         <div className="space-y-2">
                                              <Label className="text-xs font-bold text-gray-500 uppercase">Width (mm)</Label>
                                              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 border border-white/10">
                                                  <Ruler size={16} className="text-gray-500" />
                                                  <Input 
                                                    type="number" 
                                                    value={customWidth} 
                                                    onChange={e => setCustomWidth(Number(e.target.value))} 
                                                    className="border-none bg-transparent h-12 text-lg font-mono focus-visible:ring-0" 
                                                  />
                                              </div>
                                         </div>
                                         <div className="space-y-2">
                                              <Label className="text-xs font-bold text-gray-500 uppercase">Height (mm)</Label>
                                              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 border border-white/10">
                                                  <Ruler size={16} className="text-gray-500" />
                                                  <Input 
                                                    type="number" 
                                                    value={customHeight} 
                                                    onChange={e => setCustomHeight(Number(e.target.value))} 
                                                    className="border-none bg-transparent h-12 text-lg font-mono focus-visible:ring-0" 
                                                  />
                                              </div>
                                         </div>
                                     </div>
                                 )}

                                 <Button 
                                    onClick={handleResize} 
                                    disabled={!file || isProcessing}
                                    className="w-full h-16 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg rounded-2xl shadow-[0_10px_40px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                 >
                                     {isProcessing ? (
                                         <><Loader2 className="animate-spin mr-2" /> Resizing Document...</>
                                     ) : (
                                         <><Maximize className="mr-2" /> Resize PDF</>
                                     )}
                                 </Button>
                             </div>
                         ) : (
                             <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                  <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                                      <CheckCircle className="w-12 h-12 text-cyan-400" strokeWidth={3} />
                                  </div>
                                  <div>
                                      <h3 className="text-3xl font-black text-white mb-2">Resized!</h3>
                                      <p className="text-gray-400">Your document has been scaled to the new format.</p>
                                  </div>
                                  
                                  <div className="flex flex-col gap-4">
                                      <a href={result.downloadUrl} download={result.filename} className="w-full">
                                          <Button className="w-full h-14 bg-white text-blue-950 font-black text-lg hover:bg-cyan-50 rounded-xl shadow-xl">
                                              <Download className="mr-2" strokeWidth={3} /> Download PDF
                                          </Button>
                                      </a>
                                      <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}} className="text-gray-400 hover:text-white">
                                          Resize Another
                                      </Button>
                                  </div>
                             </div>
                         )}
                     </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}
