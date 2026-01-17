"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Shield, Type, Image as ImageIcon, RotateCw, Contrast, Maximize, Grid3X3, Upload, Check, X, RefreshCcw, LayoutGrid } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"
import { cn } from "@/lib/utils"

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'

export default function WatermarkClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Watermark State
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [text, setText] = useState("CONFIDENTIAL")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  // Appearance State
  const [opacity, setOpacity] = useState(0.3)
  const [rotation, setRotation] = useState(-45)
  const [scale, setScale] = useState(1) // 0.5 to 2
  const [color, setColor] = useState("#FF0000")
  const [isTiled, setIsTiled] = useState(false)
  const [position, setPosition] = useState<Position>('mc') // Middle Center

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  // Preview State
  const [numPages, setNumPages] = useState<number>(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)

  const handleFileSelect = (files: File[]) => {
      if (files[0]) {
          setFile(files[0])
          setResult(null)
      }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0])
          setImageUrl(URL.createObjectURL(e.target.files[0]))
      }
  }

  // --- PDF GENERATION LOGIC ---
  const applyWatermark = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const fileBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(fileBuffer)
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        
        let embeddedImage
        if (mode === 'image' && imageFile) {
            const imgBuffer = await imageFile.arrayBuffer()
            if (imageFile.type === 'image/png') embeddedImage = await pdfDoc.embedPng(imgBuffer)
            else embeddedImage = await pdfDoc.embedJpg(imgBuffer)
        }

        const pages = pdfDoc.getPages()
        const primaryColor = hexToRgb(color)

        for (const page of pages) {
            const { width, height } = page.getSize()
            
            // Common Ops
            const drawOps = {
                opacity,
                rotate: degrees(rotation),
            }

            if (isTiled) {
               // TILING LOGIC ---------------------------
               const gap = 150 * scale // Spacing between tiles
               const rows = Math.ceil(height / gap) + 2
               const cols = Math.ceil(width / gap) + 2
               
               const startX = -100
               const startY = -100

               for (let i = 0; i < rows; i++) {
                   for (let j = 0; j < cols; j++) {
                       const x = startX + (j * gap)
                       const y = startY + (i * gap)

                       if (mode === 'text') {
                           page.drawText(text, {
                               x, y,
                               size: 40 * scale,
                               font,
                               color: primaryColor,
                               ...drawOps
                           })
                       } else if (embeddedImage) {
                           const dims = embeddedImage.scale(0.2 * scale) // Base scale for image
                           page.drawImage(embeddedImage, {
                               x, y,
                               width: dims.width,
                               height: dims.height,
                               ...drawOps
                           })
                       }
                   }
               }

            } else {
                // SINGLE POSITION LOGIC ------------------
                // Calculate item dimensions
                let itemW = 0
                let itemH = 0

                if (mode === 'text') {
                    itemW = font.widthOfTextAtSize(text, 40 * scale)
                    itemH = font.heightAtSize(40 * scale)
                } else if (embeddedImage) {
                    const dims = embeddedImage.scale(0.5 * scale)
                    itemW = dims.width
                    itemH = dims.height
                }

                // Determine X/Y based on grid position
                let x = 0
                let y = 0
                const margin = 50

                // X Axis
                if (position.includes('l')) x = margin
                else if (position.includes('c')) x = (width / 2) - (itemW / 2)
                else if (position.includes('r')) x = width - itemW - margin

                // Y Axis (PDF coordinates: 0 is bottom!)
                // In our UI 'top' means visually top (PDF height), 'bottom' means 0
                if (position.includes('t')) y = height - itemH - margin
                else if (position.includes('m')) y = (height / 2) - (itemH / 2)
                else if (position.includes('b')) y = margin

                if (mode === 'text') {
                    page.drawText(text, {
                        x, y,
                        size: 40 * scale,
                        font,
                        color: primaryColor,
                        ...drawOps
                    })
                } else if (embeddedImage) {
                    const dims = embeddedImage.scale(0.5 * scale) // Match calc above
                    page.drawImage(embeddedImage, {
                        x, y,
                        width: dims.width,
                        height: dims.height,
                        ...drawOps
                    })
                }
            }
        }

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setResult({
            downloadUrl: url,
            filename: `watermarked-${Date.now()}.pdf`
        })

    } catch (e) {
        console.error(e)
        alert("Watermarking failed. Please ensure the file is valid.")
    } finally {
        setIsProcessing(false)
    }
  }

  // Helper
  const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      return rgb(r, g, b)
  }

  // --- PREVIEW STYLES ---
  
  // Calculate simulated style for HTML overlay
  const previewStyle = useMemo(() => {
      const common = {
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          color: color,
      } as React.CSSProperties

      if (isTiled) {
          return {
              ...common,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)', // Simplified tile simulation
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: '4rem',
              width: '150%', // Oversized to handle rotation
              height: '150%',
              position: 'absolute' as const,
              top: '-25%',
              left: '-25%',
              alignItems: 'center',
              justifyItems: 'center',
              pointerEvents: 'none' as const, 
          }
      }

      // Single Position Simulation
      // Map 'tl', 'mc' etc to CSS flex/absolute alignment
      const posStyles: any = { position: 'absolute', pointerEvents: 'none' }
      const m = '2rem' // Margin

      if (position.includes('t')) posStyles.top = m
      if (position.includes('m')) posStyles.top = '50%'
      if (position.includes('b')) posStyles.bottom = m

      if (position.includes('l')) posStyles.left = m
      if (position.includes('c')) posStyles.left = '50%'
      if (position.includes('r')) posStyles.right = m
      
      if (position.includes('c')) posStyles.transform = `${posStyles.transform || ''} translateX(-50%)`
      if (position.includes('m')) posStyles.transform = `${posStyles.transform || ''} translateY(-50%)`
      
      // Merge transforms
      // Note: HTML rotation is easier if we wrapper it. 
      // For this simplified logic, we'll apply rotation to the content, positioning to the wrapper.
      return {
          ...posStyles,
          opacity: 1 // Wrapper opacity? No, apply to content
      } 

  }, [opacity, rotation, scale, color, isTiled, position])
  
  // Content Style (Inner)
  const contentStyle = {
     opacity: opacity,
     transform: `rotate(${rotation}deg) scale(${scale})`,
     color: color,
     fontSize: '2rem',
     fontWeight: 'bold',
     whiteSpace: 'nowrap' as const,
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-red-500/30 selection:text-white font-sans overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-8 pt-24">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                 <Shield className="w-8 h-8 text-red-500" />
             </motion.div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                Watermark <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">PDF</span>
             </h1>
             <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Secure your documents with professional styling. Text, Logos, and Tiled Patterns.
             </p>
        </div>

        {!file ? (
            <div className="max-w-xl mx-auto mt-8">
               <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/0 shadow-2xl">
                    <div className="p-10 rounded-[2.3rem] bg-[#0A0A0F] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50"></div>
                        <FileUploader onFileSelect={handleFileSelect} accept=".pdf" />
                    </div>
               </div>
            </div>
        ) : !result ? (
            <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start h-[calc(100vh-250px)] min-h-[600px]">
                
                {/* SETTINGS PANEL */}
                <div className="h-full flex flex-col gap-6 p-6 rounded-[2rem] bg-[#0A0A0F] border border-white/5 shadow-2xl backdrop-blur-xl overflow-y-auto custom-scrollbar">
                    
                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl">
                            <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Text</TabsTrigger>
                            <TabsTrigger value="image" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Image</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="text" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-gray-500">Watermark Text</Label>
                                <Input 
                                    value={text} 
                                    onChange={(e) => setText(e.target.value)} 
                                    className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:border-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-gray-500">Text Color</Label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {['#FF0000', '#000000', '#FFFFFF', '#0000FF', '#00FF00', '#FFA500'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={cn("w-8 h-8 rounded-full border border-white/10 shadow-lg transition-transform hover:scale-110", color === c && "ring-2 ring-white")}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full overflow-hidden cursor-pointer" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="image" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-gray-500">Upload Logo</Label>
                                <div className="border border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition-colors relative">
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {imageUrl ? (
                                        <img src={imageUrl} className="h-20 mx-auto object-contain" alt="preview" />
                                    ) : (
                                        <div className="text-gray-500 flex flex-col items-center">
                                            <Upload size={20} className="mb-2" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Common Controls */}
                    <div className="space-y-6 flex-1">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="text-xs uppercase font-bold text-gray-500">Pattern</Label>
                                <span className={cn("text-xs font-bold", isTiled ? "text-red-400" : "text-gray-500")}>
                                    {isTiled ? "Tiled Pattern" : "Single Stamp"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsTiled(false)}
                                    className={cn("h-10 border-white/10 hover:bg-white/5 hover:text-white", !isTiled && "bg-red-600 border-red-500 text-white hover:bg-red-500")}
                                >
                                    <Maximize size={16} className="mr-2" /> Single
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsTiled(true)}
                                    className={cn("h-10 border-white/10 hover:bg-white/5 hover:text-white", isTiled && "bg-red-600 border-red-500 text-white hover:bg-red-500")}
                                >
                                    <LayoutGrid size={16} className="mr-2" /> Tile
                                </Button>
                            </div>
                        </div>

                        {!isTiled && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs uppercase font-bold text-gray-500">Position</Label>
                                <div className="grid grid-cols-3 gap-2 max-w-[160px] mx-auto bg-black/20 p-2 rounded-xl">
                                    {['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPosition(p as Position)}
                                            className={cn(
                                                "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                                                position === p 
                                                    ? "bg-red-600 border-red-500 text-white shadow-lg scale-105" 
                                                    : "bg-white/5 border-white/10 text-gray-600 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 border-t border-white/5 pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                    <span>Opacity</span>
                                    <span className="text-white">{Math.round(opacity * 100)}%</span>
                                </div>
                                <Slider value={[opacity]} min={0.1} max={1} step={0.1} onValueChange={([v]) => setOpacity(v)} className="py-2" />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                    <span>Rotation</span>
                                    <span className="text-white">{rotation}°</span>
                                </div>
                                <Slider value={[rotation]} min={-180} max={180} step={15} onValueChange={([v]) => setRotation(v)} className="py-2" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                    <span>Size / Scale</span>
                                    <span className="text-white">{scale}x</span>
                                </div>
                                <Slider value={[scale]} min={0.5} max={3} step={0.1} onValueChange={([v]) => setScale(v)} className="py-2" />
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={applyWatermark}
                        disabled={isProcessing}
                        className="w-full h-14 bg-white text-black hover:bg-gray-200 font-bold text-lg rounded-xl shadow-xl mt-auto"
                    >
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2" />}
                        Apply Watermark
                    </Button>

                </div>

                {/* PREVIEW PANEL */}
                <div className="h-full bg-[#1a1a20]/50 border border-white/5 rounded-[2rem] backdrop-blur-md flex items-center justify-center p-8 overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                         <div className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase border border-white/10 backdrop-blur-md flex items-center gap-1">
                             <Check size={10} className="text-red-500" /> Live Preview
                         </div>
                    </div>
                    
                    <div className="relative shadow-2xl rounded-sm transition-transform duration-300">
                        <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="opacity-90">
                            <Page 
                                pageNumber={1} 
                                width={600} 
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={({ width, height }) => {
                                    setPageWidth(width);
                                    setPageHeight(height);
                                }}
                            />
                        </Document>
                        
                        {/* HTML OVERLAY FOR PREVIEW */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {isTiled ? (
                                <div style={previewStyle as React.CSSProperties}>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} style={contentStyle}>
                                            {mode === 'image' && imageUrl ? (
                                                <img src={imageUrl} alt="" className="max-w-[100px] opacity-100" />
                                            ) : (
                                                <span>{text}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={previewStyle as React.CSSProperties}>
                                    <div style={contentStyle}>
                                        {mode === 'image' && imageUrl ? (
                                            <img src={imageUrl} alt="" className="max-w-[200px]" />
                                        ) : (
                                            <span>{text}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-xl mx-auto py-12"
            >
                <div className="p-1 rounded-[3.5rem] bg-gradient-to-b from-green-500/20 to-transparent">
                    <div className="bg-[#0A0A0F]/80 p-12 rounded-[3.4rem] border border-white/5 backdrop-blur-xl text-center shadow-2xl">
                        <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-8 animate-float shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4">Secured!</h2>
                        <p className="text-gray-400 text-lg mb-10">Your document watermark has been applied successfully.</p>
                        
                        <div className="space-y-4">
                            <a href={result.downloadUrl} download={result.filename}>
                                <Button className="w-full h-16 bg-white text-black hover:bg-gray-100 font-bold text-xl rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
                                    <Download className="mr-3" /> Download PDF
                                </Button>
                            </a>
                            <Button 
                                variant="ghost" 
                                onClick={() => { setFile(null); setResult(null); }}
                                className="w-full h-14 text-gray-500 hover:text-white"
                            >
                                <RefreshCcw className="mr-2 w-4 h-4" /> Watermark Another File
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  )
}
