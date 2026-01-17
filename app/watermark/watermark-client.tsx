"use client"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Shield, Type, Palette, RotateCw, Contrast, Maximize, Upload, Check } from "lucide-react"
import { motion } from "framer-motion"

export default function WatermarkClient() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])
  
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
    <div className="min-h-screen bg-[#030014] text-white selection:bg-red-500/30 selection:text-white font-sans overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-float">
                <Shield size={32} />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Watermark PDF</h1>
                <p className="text-gray-400 text-lg">Secure your documents with professional text overlays.</p>
            </div>
        </div>
        {!file ? (
            <div className="max-w-xl mx-auto mt-12">
               <div className="p-10 rounded-[2.5rem] bg-[#0A0A0F]/60 border border-white/5 shadow-2xl relative overflow-hidden group backdrop-blur-xl">
                   <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   <div className="relative z-10 text-center space-y-8">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-500">
                             <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Upload Source PDF</h2>
                            <p className="text-gray-400">Select a PDF file to begin watermarking</p>
                        </div>
                        <FileUploader onFileSelect={handleFileSelect} accept=".pdf" />
                   </div>
               </div>
            </div>
        ) : !result ? (
            <div className="flex flex-col lg:flex-row gap-8 items-start h-[calc(100vh-200px)] min-h-[600px]">
                <div className="w-full lg:w-96 shrink-0 p-6 rounded-[2rem] bg-[#0A0A0F]/80 border border-white/5 flex flex-col gap-6 shadow-2xl backdrop-blur-xl h-full overflow-y-auto custom-scrollbar">
                    
                    <div className="space-y-4 filter-group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Type size={12} /> Text Content
                        </label>
                        <Input 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className="bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-gray-600 focus:border-red-500/50"
                            placeholder="e.g. DRAFT"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Palette size={12} /> Color
                        </label>
                        <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" 
                            />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase">Hex Code</span>
                                <span className="text-sm font-mono text-white">{color}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                           <span className="flex items-center gap-2"><Contrast size={12} /> Opacity</span>
                           <span className="text-white">{Math.round(opacity * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0.1" max="1" step="0.1" 
                            value={opacity} 
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-2"><RotateCw size={12} /> Rotation</span>
                            <span className="text-white">{rotation}°</span>
                        </label>
                        <input 
                            type="range" min="-180" max="180" step="15"
                            value={rotation} 
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-2"><Maximize size={12} /> Size</span>
                            <span className="text-white">{size}px</span>
                        </label>
                        <input 
                            type="range" min="10" max="200" step="5"
                            value={size} 
                            onChange={(e) => setSize(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                        <Button 
                            onClick={handleApply} 
                            disabled={isProcessing}
                            className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2 w-4 h-4" />}
                            Apply Stamp
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-gray-400 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                            onClick={() => { setFile(null); setFileUrl(null); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-[#1a1a20]/50 border border-white/5 flex items-center justify-center p-8 overflow-hidden relative rounded-[2rem] backdrop-blur-md shadow-2xl">
                    <div className="relative shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10">
                         <Document file={fileUrl}>
                             <Page 
                                pageNumber={1} 
                                width={600} 
                                className="shadow-2xl opacity-90"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                             />
                         </Document>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                             <div 
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    opacity: opacity,
                                    fontSize: `${size}px`,
                                    color: color,
                                    fontWeight: 'bold',
                                    fontFamily: 'var(--font-space)', // Use new font var
                                    whiteSpace: 'nowrap',
                                    userSelect: 'none',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}
                             >
                                 {text}
                             </div>
                         </div>
                    </div>
                    <div className="absolute bottom-6 right-6 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur border border-white/10 font-bold tracking-wide">
                        Live Preview (Page 1)
                    </div>
                </div>
            </div>
        ) : (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8 glass-card p-12 rounded-[3.5rem] border-white/5 bg-[#0A0A0F]/60">
                 <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse-slow">
                    <Check className="w-10 h-10 text-red-500" strokeWidth={3} />
                 </div>
                 <h2 className="text-4xl font-black text-white tracking-tight">Watermark Added!</h2>
                 <p className="text-gray-400">Your document has been securely stamped and is ready for download.</p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <a href={result.downloadUrl} download={result.filename} className="w-full sm:w-auto">
                        <Button className="w-full h-16 px-10 rounded-2xl bg-white text-black hover:bg-red-50 font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-300">
                            <Download className="mr-2" /> Download Document
                        </Button>
                        </a>
                        <Button 
                        variant="ghost"
                        onClick={() => { setResult(null); setFile(null); setFileUrl(null); }}
                        className="h-16 px-8 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
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
