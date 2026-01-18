"use client"

import { useState } from "react"
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Hash, AlignCenter, AlignLeft, AlignRight, Check, Type, Palette, MoveVertical, Layers } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function PageNumbersClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Settings
  const [position, setPosition] = useState<"bottom-left" | "bottom-center" | "bottom-right" | "top-left" | "top-center" | "top-right">("bottom-center")
  const [startPage, setStartPage] = useState(1)
  const [startNumber, setStartNumber] = useState(1)
  const [format, setFormat] = useState<"n" | "Page n" | "n of N">("n")
  const [fontSize, setFontSize] = useState(12)
  const [color, setColor] = useState("#000000")
  const [margin, setMargin] = useState(20)

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()
        const totalPages = pages.length
        
        // Parse hex color
        const r = parseInt(color.slice(1, 3), 16) / 255
        const g = parseInt(color.slice(3, 5), 16) / 255
        const b = parseInt(color.slice(5, 7), 16) / 255
        
        pages.forEach((page, idx) => {
            const pageNum = idx + 1
            if (pageNum < startPage) return
            
            const displayNum = startNumber + (pageNum - startPage)
            let text = ""
            if (format === "n") text = `${displayNum}`
            if (format === "Page n") text = `Page ${displayNum}`
            if (format === "n of N") text = `${displayNum} of ${totalPages}`
            
            const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize)
            const { width, height } = page.getSize()
            
            let x = 0
            let y = 0
            
            // X Position
            if (position.includes("left")) x = margin
            if (position.includes("center")) x = (width / 2) - (textWidth / 2)
            if (position.includes("right")) x = width - textWidth - margin
            
            // Y Position
            if (position.includes("bottom")) y = margin
            if (position.includes("top")) y = height - fontSize - margin
            
            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font: helveticaFont,
                color: rgb(r, g, b),
            })
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        setResult({
            downloadUrl: url,
            filename: `numbered-${file.name}`
        })
    } catch (err) {
        console.error(err)
        alert("Failed to process PDF. Please try again.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#020410] text-white selection:bg-blue-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                     <Hash className="w-4 h-4" />
                     <span>Numbering Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                     Smart <span className="text-blue-500">Pagination</span>
                 </h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                     Add customizable page numbers, formatting, and positioning entirely in your browser.
                 </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
             
                 {/* LEFT: FILE & PREVIEW */}
                 <div className="lg:col-span-5 space-y-6">
                     <Card className="p-1 bg-gradient-to-br from-white/10 to-transparent border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="bg-[#0A0C16] p-8 rounded-[1.9rem] min-h-[400px] flex flex-col items-center justify-center border border-white/5 relative">
                             {!file ? (
                                 <div className="w-full">
                                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                 </div>
                             ) : (
                                 <div className="w-full space-y-6 text-center">
                                     <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 mb-4 animate-in zoom-in-50 duration-500">
                                         <Hash size={40} />
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
                     <Card className="bg-[#0A0C16]/80 backdrop-blur-md border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                         {!result ? (
                             <div className="space-y-8 relative z-10">
                                 {/* Settings Group 1: Format & Range */}
                                 <div className="grid sm:grid-cols-2 gap-6">
                                     <div className="space-y-3">
                                         <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Format</Label>
                                         <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                             <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                                 <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="n">1, 2, 3...</SelectItem>
                                                 <SelectItem value="Page n">Page 1, Page 2...</SelectItem>
                                                 <SelectItem value="n of N">1 of 10, 2 of 10...</SelectItem>
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div className="space-y-3">
                                         <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Start Numbering At</Label>
                                         <Input 
                                            type="number" 
                                            min={1} 
                                            value={startNumber}
                                            onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl" 
                                         />
                                     </div>
                                 </div>

                                 {/* Settings Group 2: Position */}
                                 <div className="space-y-3">
                                     <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Position</Label>
                                     <div className="grid grid-cols-3 gap-3 p-1 bg-white/5 rounded-2xl border border-white/5">
                                         {[
                                             { id: "bottom-left", icon: AlignLeft, label: "Left" },
                                             { id: "bottom-center", icon: AlignCenter, label: "Center" },
                                             { id: "bottom-right", icon: AlignRight, label: "Right" },
                                             { id: "top-left", icon: AlignLeft, label: "Top Left" },
                                             { id: "top-center", icon: AlignCenter, label: "Top Center" },
                                             { id: "top-right", icon: AlignRight, label: "Top Right" },
                                         ].filter(p => !p.id.includes('top')).map((opt) => ( // Simplified for UI cleanliness, limiting to bottom row primarily or toggle
                                             <button
                                                 key={opt.id}
                                                 onClick={() => setPosition(opt.id as any)}
                                                 className={cn(
                                                     "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                                                     position === opt.id 
                                                         ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
                                                         : "hover:bg-white/5 text-gray-500 hover:text-white"
                                                 )}
                                             >
                                                 <opt.icon size={20} />
                                                 <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                                             </button>
                                         ))}
                                     </div>
                                     <div className="flex justify-center pt-2">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10" onClick={() => setPosition(p => p.includes('bottom') ? p.replace('bottom', 'top') as any : p.replace('top', 'bottom') as any)}>
                                            <MoveVertical size={14} />
                                            Toggle Top/Bottom: Currently {position.split('-')[0].toUpperCase()}
                                        </div>
                                     </div>
                                 </div>

                                 {/* Settings Group 3: Appearance */}
                                 <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                          <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                              <Type size={14} /> Font Size
                                          </Label>
                                          <div className="flex items-center gap-4">
                                              <Input 
                                                  type="range" min="8" max="24" value={fontSize} 
                                                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                  className="h-2 bg-blue-500/20"
                                              />
                                              <span className="w-8 text-sm font-bold">{fontSize}</span>
                                          </div>
                                      </div>
                                      <div className="space-y-3">
                                          <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                              <Palette size={14} /> Color
                                          </Label>
                                          <div className="flex items-center gap-3">
                                              <input 
                                                  type="color" 
                                                  value={color}
                                                  onChange={(e) => setColor(e.target.value)}
                                                  className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-none"
                                              />
                                              <span className="text-xs uppercase font-mono text-gray-400">{color}</span>
                                          </div>
                                      </div>
                                 </div>

                                 <Button 
                                    onClick={handleApply} 
                                    disabled={!file || isProcessing}
                                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                 >
                                     {isProcessing ? (
                                         <><Loader2 className="animate-spin mr-2" /> Applying Numbers...</>
                                     ) : (
                                         <><Layers className="mr-2" /> Start Numbering</>
                                     )}
                                 </Button>
                             </div>
                         ) : (
                             <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                      <Check className="w-12 h-12 text-emerald-400" strokeWidth={3} />
                                  </div>
                                  <div>
                                      <h3 className="text-3xl font-black text-white mb-2">Success!</h3>
                                      <p className="text-gray-400">Page numbers have been added to your document.</p>
                                  </div>
                                  
                                  <div className="flex flex-col gap-4">
                                      <a href={result.downloadUrl} download={result.filename} className="w-full">
                                          <Button className="w-full h-14 bg-white text-blue-950 font-black text-lg hover:bg-emerald-50 rounded-xl shadow-xl">
                                              <Download className="mr-2" strokeWidth={3} /> Download PDF
                                          </Button>
                                      </a>
                                      <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}} className="text-gray-400 hover:text-white">
                                          Number Another PDF
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
