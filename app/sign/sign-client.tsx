"use client"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { FileUploader } from "@/components/file-uploader"
import { SiteHeader } from "@/components/site-header"
import { 
  Signature, PenTool, Download, Check, Trash2, 
  Loader2, MousePointer2, Eraser, Move, Sparkles, 
  Type, Image as ImageIcon, Palette, Shield, X, GripHorizontal, Upload 
} from "lucide-react"
import SignatureCanvas from "react-signature-canvas"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function SignClient() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [activePage, setActivePage] = useState(1)
  
  // Signature State
  const [signature, setSignature] = useState<string | null>(null)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  
  // Customization State
  const [inkColor, setInkColor] = useState("#000000")
  const [penSize, setPenSize] = useState(2)
  const [typedText, setTypedText] = useState("")
  const [fontStyle, setFontStyle] = useState("font-caveat")
  
  // Positioning State
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 }) // Percentage 0-100
  const [sigScale, setSigScale] = useState(1)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  
  const sigCanvas = useRef<SignatureCanvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0])
      setFileUrl(URL.createObjectURL(files[0]))
      setResultUrl(null)
    }
  }

  // --- SIGNATURE GENERATION ---
  const handleSaveDraw = () => {
    if (sigCanvas.current?.isEmpty()) return
    // We get the canvas, but we need to ensure color is applied if it wasn't during draw
    // Actually react-signature-canvas handles color during draw.
    setSignature(sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)
    setIsSignModalOpen(false)
  }

  const handleSaveType = () => {
    if (!typedText) return
    
    // Create canvas to rasterize text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 600
    canvas.height = 200
    
    // Config font
    let fontFamily = 'cursive'
    if (fontStyle === 'font-caveat') fontFamily = 'Caveat, cursive'
    if (fontStyle === 'font-dancing') fontFamily = 'Dancing Script, cursive'
    if (fontStyle === 'font-pacifico') fontFamily = 'Pacifico, cursive'
    
    ctx.font = `60px ${fontFamily}`
    ctx.fillStyle = inkColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedText, canvas.width / 2, canvas.height / 2)
    
    setSignature(canvas.toDataURL('image/png'))
    setIsSignModalOpen(false)
  }

  const handleUploadSign = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader()
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setSignature(ev.target.result as string)
                  setIsSignModalOpen(false)
              }
          }
          reader.readAsDataURL(e.target.files[0])
      }
  }

  // --- DRAG LOGIC ---
  const handleDragEnd = (event: any, info: any) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      
      // Calculate percentage position based on the drag offset
      // Framer motion gives us delta, but we need absolute relative to container
      // This is a simplified approach using the visual center roughly
      // A robust implementation uses the parent bounds.
      
      // For this MVP improvement, we'll assume the visual placement is correct
      // and update state based on where the element visually landed if possible. 
      // Actually, relying on visual drag is tricky for PDF coordinates.
      // Let's stick to the click-to-place for precision, or improve drag.
      
      // Improved: We let framer handle visual drag, but we need to record the final X/Y %.
      // We can use `onDragEnd` to calculate relative position from the event clientX/Y
      const clientX = info.point.x
      const clientY = info.point.y
      
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      
      setSigPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  const handleSign = async () => {
    if (!file || !signature) return
    setIsProcessing(true)
    try {
      const existingPdfBytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      const sigImage = await pdfDoc.embedPng(signature)
      
      const pages = pdfDoc.getPages()
      const currentPage = pages[activePage - 1]
      const { width, height } = currentPage.getSize()
      
      const sigWidth = 150 * sigScale
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth
      
      // Setup coordinates (PDF origin is bottom-left)
      // Visual origin is top-left
      const x = (sigPosition.x / 100) * width - (sigWidth / 2)
      const y = (1 - (sigPosition.y / 100)) * height - (sigHeight / 2)

      currentPage.drawImage(sigImage, {
        x: x,
        y: y,
        width: sigWidth,
        height: sigHeight,
      })
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
      alert("Failed to sign PDF")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-amber-500/30 selection:text-white font-sans overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 pt-32 pb-12">
        <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Signature size={32} />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">eSignature <span className="text-amber-500">Studio</span></h1>
                <p className="text-gray-400 text-lg">Professionally sign, certify, and secure your documents.</p>
            </div>
        </div>

        {!file ? (
            <div className="max-w-xl mx-auto mt-12">
               <div className="p-10 rounded-[2.5rem] bg-[#0A0A0F]/60 border border-white/5 shadow-2xl relative overflow-hidden group backdrop-blur-xl hover:border-amber-500/30 transition-all">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   <div className="relative z-10 text-center space-y-8">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-500">
                             <PenTool className="w-10 h-10 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Upload to Sign</h2>
                            <p className="text-gray-400">Secure client-side processing. Your files never leave this device.</p>
                        </div>
                        <FileUploader onFileSelect={handleFileSelect} accept=".pdf" />
                   </div>
               </div>
            </div>
        ) : !resultUrl ? (
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 h-[calc(100vh-250px)] min-h-[600px]">
                
                {/* PDF PREVIEW AREA */}
                <div 
                    ref={containerRef}
                    className="relative bg-[#0A0A0F]/50 rounded-[2rem] border border-white/5 overflow-hidden flex items-center justify-center p-8 shadow-inner backdrop-blur-sm"
                    onClick={(e) => {
                         // Click to Place Logic
                         if (!containerRef.current) return
                         const rect = containerRef.current.getBoundingClientRect()
                         const x = ((e.clientX - rect.left) / rect.width) * 100
                         const y = ((e.clientY - rect.top) / rect.height) * 100
                         setSigPosition({ x, y })
                    }}
                >
                    <div className="relative shadow-2xl rounded-sm ring-1 ring-white/10 group transition-transform duration-300">
                        <Document 
                            file={fileUrl} 
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            className="bg-white/5"
                        >
                            <Page 
                                pageNumber={activePage} 
                                width={600}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="opacity-90 transition-opacity group-hover:opacity-100"
                            />
                        </Document>
                        
                        {/* SIGNATURE OVERLAY */}
                        {signature && (
                            <motion.div 
                                drag
                                dragMomentum={false}
                                onDragEnd={handleDragEnd}
                                className="absolute cursor-move z-50 group hover:ring-2 hover:ring-amber-500 rounded-lg"
                                style={{ 
                                    width: 150 * sigScale,
                                    left: `${sigPosition.x}%`, 
                                    top: `${sigPosition.y}%`,
                                    x: '-50%',
                                    y: '-50%' 
                                }}
                            >
                                <div className="relative">
                                    <img src={signature} alt="Sign" className="w-full drop-shadow-xl" />
                                    {/* Resize Handles - Visual Only for MVP */}
                                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 cursor-se-resize"></div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Click Target Indicator */}
                        {!signature && (
                            <div 
                                className="absolute w-4 h-4 border-2 border-amber-500/50 rounded-full pointer-events-none animate-ping"
                                style={{ left: `${sigPosition.x}%`, top: `${sigPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                            ></div>
                        )}
                    </div>

                    {/* Page Controls */}
                    <div className="absolute bottom-8 flex items-center gap-6 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl">
                        <Button 
                            variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); setActivePage(p => Math.max(1, p - 1)) }}
                            disabled={activePage === 1}
                        >
                            <Move className="w-4 h-4 rotate-180" />
                        </Button>
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-gray-300">Page {activePage} of {numPages}</span>
                        <Button 
                            variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); setActivePage(p => Math.min(numPages, p + 1)) }}
                            disabled={activePage === numPages}
                        >
                            <Move className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* CONTROLS SIDEBAR */}
                <div className="flex flex-col gap-6 p-6 rounded-[2rem] bg-[#0A0A0F]/80 border border-white/5 shadow-2xl backdrop-blur-xl h-full overflow-y-auto custom-scrollbar">
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Signature size={12} /> Current Signature
                            </h3>
                             {signature && (
                                <button onClick={() => setSignature(null)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <Trash2 size={12} /> Remove
                                </button>
                             )}
                        </div>
                        
                        {signature ? (
                            <div className="p-6 bg-white rounded-xl border border-white/10 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid-black/[0.05]"></div>
                                <img src={signature} alt="Signature" className="w-full relative z-10" />
                            </div>
                        ) : (
                            <Button 
                                onClick={() => setIsSignModalOpen(true)}
                                className="w-full h-24 border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 text-gray-400 hover:text-white rounded-2xl flex flex-col gap-3 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                    <PenTool className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Create New Signature</span>
                            </Button>
                        )}
                    </div>

                    {signature && (
                        <div className="space-y-6 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                    <span>Size Scale</span>
                                    <span className="text-white">{Math.round(sigScale * 100)}%</span>
                                </div>
                                <Slider value={[sigScale]} min={0.5} max={2} step={0.1} onValueChange={([v]) => setSigScale(v)} className="py-2" />
                            </div>
                            
                            <div className="text-xs text-amber-500/80 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 leading-relaxed">
                                <Sparkles className="w-3 h-3 inline mr-2" />
                                Click anywhere on the document or drag the signature to position it.
                            </div>
                        </div>
                    )}

                    <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                        <Button 
                            onClick={handleSign}
                            disabled={!signature || isProcessing}
                            className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2 w-4 h-4" />}
                            Sign & Certify
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => { setFile(null); setSignature(null); }}
                            className="w-full text-gray-400 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                        >
                            Cancel
                        </Button>
                    </div>

                </div>
            </div>
        ) : (
             <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95">
                  <div className="glass-card rounded-[3rem] p-12 border border-white/10 shadow-2xl bg-[#0A0A0F]/60">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 text-white tracking-tight">Signed Successfully!</h2>
                        <p className="text-gray-400 mb-10 text-lg">Your document is now certified and ready for download.</p>
                        
                        <div className="space-y-4">
                            <a href={resultUrl} download="signed-document.pdf" className="block w-full">
                                <Button className="w-full h-16 bg-white text-black font-black text-xl hover:bg-emerald-50 rounded-2xl shadow-xl transition-transform hover:scale-105">
                                    <Download className="mr-2" size={24} /> Download PDF
                                </Button>
                            </a>
                            <Button 
                                variant="ghost" 
                                onClick={() => { setResultUrl(null); setFile(null); setSignature(null); }} 
                                className="w-full h-14 text-gray-500 hover:text-white"
                            >
                                Sign Another Document
                            </Button>
                        </div>
                  </div>
             </div>
        )}
      </div>

      {/* SIGNATURE CREATION MODAL */}
      <AnimatePresence>
        {isSignModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={() => setIsSignModalOpen(false)}
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-[#0F0F16] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <PenTool size={18} className="text-amber-500" /> Create Signature
                        </h2>
                        <button onClick={() => setIsSignModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                    </div>

                    <Tabs defaultValue="draw" className="p-6">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl mb-6">
                            <TabsTrigger value="draw" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">Draw</TabsTrigger>
                            <TabsTrigger value="type" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">Type</TabsTrigger>
                            <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">Upload</TabsTrigger>
                        </TabsList>

                        <TabsContent value="draw" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {['#000000', '#0000FF', '#FF0000'].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setInkColor(c)}
                                                className={cn("w-6 h-6 rounded-full border border-white/20", inkColor === c && "ring-2 ring-white scale-110")}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={() => sigCanvas.current?.clear()} className="text-xs font-bold text-gray-500 hover:text-white uppercase">Clear</button>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden h-64 border-2 border-dashed border-white/10 hover:border-amber-500/50 transition-colors">
                                    <SignatureCanvas 
                                        ref={(ref) => { sigCanvas.current = ref }}
                                        penColor={inkColor}
                                        minWidth={1}
                                        maxWidth={3}
                                        canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveDraw} className="w-full h-12 bg-amber-600 hover:bg-amber-500 font-bold text-white rounded-xl">Use Drawn Signature</Button>
                        </TabsContent>

                        <TabsContent value="type" className="space-y-6">
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Type your name..." 
                                    className="h-14 bg-white/5 border-white/10 text-xl text-center rounded-xl focus:border-amber-500"
                                    value={typedText}
                                    onChange={(e) => setTypedText(e.target.value)}
                                />
                                <div className="grid grid-cols-1 gap-2">
                                    {['font-caveat', 'font-dancing', 'font-pacifico'].map((font) => (
                                        <div 
                                            key={font}
                                            onClick={() => setFontStyle(font)}
                                            className={cn(
                                                "p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5",
                                                fontStyle === font ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/10 text-gray-400"
                                            )}
                                        >
                                            <p className={`text-2xl text-center ${font}`} style={{ fontFamily: font === 'font-caveat' ? 'Caveat, cursive' : font === 'font-dancing' ? 'Dancing Script, cursive' : 'Pacifico, cursive' }}>
                                                {typedText || "Signature Preview"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleSaveType} disabled={!typedText} className="w-full h-12 bg-amber-600 hover:bg-amber-500 font-bold text-white rounded-xl">Use Typescript</Button>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-6">
                            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:bg-white/5 transition-colors text-center relative">
                                <input type="file" accept="image/*" onChange={handleUploadSign} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-lg font-bold text-white mb-2">Click to Upload Image</p>
                                <p className="text-gray-500 text-sm">PNG or JPG files accepted</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}
