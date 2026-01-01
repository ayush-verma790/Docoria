"use client"

import { useState, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Shield, Type, Palette, RotateCw, Contrast, Maximize, Upload, Check } from "lucide-react"
import { motion } from "framer-motion"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  
  // Watermark Settings
  const [text, setText] = useState("CONFIDENTIAL")
  const [opacity, setOpacity] = useState(0.5)
  const [rotation, setRotation] = useState(-45)
  const [size, setSize] = useState(60)
  const [color, setColor] = useState("#FF0000")
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleFileSelect = (files: File[]) => {
      if (files[0]) {
          setFile(files[0])
          setFileUrl(URL.createObjectURL(files[0]))
          setResult(null)
      }
  }

  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("text", text)
        formData.append("opacity", opacity.toString())
        formData.append("rotation", rotation.toString())
        formData.append("size", size.toString())
        formData.append("color", color)

        const res = await fetch("/api/watermark", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        setResult(data)
    } catch (err) {
        console.error(err)
        alert("Failed to apply watermark")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-500/30 selection:text-red-200">
        
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Shield size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Watermark PDF</h1>
                <p className="text-slate-400">Stamp your documents with text overlays.</p>
            </div>
        </div>

        {!file ? (
            <Card className="max-w-xl mx-auto p-12 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl mt-12">
               <div className="text-center mb-8">
                   <h2 className="text-xl font-bold mb-2">Upload File</h2>
                   <p className="text-slate-400 text-sm">Select a PDF to watermark</p>
               </div>
               <FileUploader onFileSelect={handleFileSelect} accept=".pdf" />
            </Card>
        ) : !result ? (
            <div className="flex flex-col lg:flex-row gap-8 items-start h-[calc(100vh-200px)]">
                
                {/* Controls Panel */}
                <Card className="w-full lg:w-80 shrink-0 p-6 bg-slate-900 border-white/10 flex flex-col gap-6 shadow-xl h-full overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <Type size={12} /> Text Content
                        </label>
                        <Input 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className="bg-slate-950 border-white/10"
                            placeholder="e.g. DRAFT"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                             <Palette size={12} /> Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" 
                            />
                            <span className="text-sm font-mono text-slate-400">{color}</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <Contrast size={12} /> Opacity: {Math.round(opacity * 100)}%
                        </label>
                        <input 
                            type="range" min="0.1" max="1" step="0.1" 
                            value={opacity} 
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <RotateCw size={12} /> Rotation: {rotation}°
                        </label>
                        <input 
                            type="range" min="-180" max="180" step="15"
                            value={rotation} 
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                            <Maximize size={12} /> Size: {size}px
                        </label>
                        <input 
                            type="range" min="10" max="200" step="5"
                            value={size} 
                            onChange={(e) => setSize(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                        <Button 
                            onClick={handleApply} 
                            disabled={isProcessing}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2 w-4 h-4" />}
                            Apply Watermark
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-slate-400"
                            onClick={() => { setFile(null); setFileUrl(null); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-center p-8 overflow-hidden relative">
                    <div className="relative shadow-2xl">
                         {/* The PDF Page */}
                         <Document file={fileUrl}>
                             <Page 
                                pageNumber={1} 
                                width={600} 
                                className="shadow-2xl"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                             />
                         </Document>

                         {/* The Watermark Overlay (Live Preview) */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                             <div 
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    opacity: opacity,
                                    fontSize: `${size}px`,
                                    color: color,
                                    fontWeight: 'bold',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                    whiteSpace: 'nowrap',
                                    userSelect: 'none'
                                }}
                             >
                                 {text}
                             </div>
                         </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                        Live Preview (Page 1)
                    </div>
                </div>
            </div>
        ) : (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8">
                 <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]">
                    <Check className="w-12 h-12 text-red-500" />
                 </div>
                 <h2 className="text-3xl font-bold">Watermark Added!</h2>
                 <div className="flex justify-center gap-4">
                        <a href={result.downloadUrl} download={result.filename}>
                        <Button className="h-14 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg">
                            <Download className="mr-2" /> Download PDF
                        </Button>
                        </a>
                        <Button 
                        variant="ghost"
                        onClick={() => { setResult(null); setFile(null); setFileUrl(null); }}
                        className="h-14 px-8 rounded-xl text-white hover:bg-white/10"
                        >
                        Start Over
                        </Button>
                 </div>
            </div>
        )}

      </div>
    </div>
  )
}
