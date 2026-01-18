"use client"

import { useState, useEffect, useRef } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { Scan, Type, Copy, Check, Download, Loader2, Sparkles, RefreshCw, Sliders, Play, Pause, Languages, Image as ImageIcon, Camera, X } from "lucide-react"
import { createWorker } from "tesseract.js"

// Language Options
const LANGUAGES = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
]

export default function ScannerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [processedPreview, setProcessedPreview] = useState<string>("")
  const [text, setText] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState("")
  const [copied, setCopied] = useState(false)
  
  // Editor State
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [grayscale, setGrayscale] = useState(false)
  const [language, setLanguage] = useState('eng')

  // Speech State
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
        setIsCameraOpen(true)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    } catch (err) {
        alert("Camera access denied")
        setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
      }
      setIsCameraOpen(false)
  }

  const captureImage = () => {
      if (!videoRef.current) return
      
      const video = videoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
          ctx.drawImage(video, 0, 0)
          canvas.toBlob(blob => {
              if (blob) {
                  const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
                  setFile(file)
                  stopCamera()
              }
          }, 'image/jpeg')
      }
  }

  // 1. Handle File Selection & Initial Preview
  useEffect(() => {
    if (file) {
      applyFilters()
    } else {
        setProcessedPreview("")
        setText("")
    }
  }, [file, brightness, contrast, grayscale])

  // 2. Apply Image Filters (Brightness, Contrast, B/W)
  const applyFilters = () => {
      if (!file) return
      
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return
          
          // Set canvas dimensions to match image
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // Apply CSS-like filters
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : 'grayscale(0%)'}`
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          setProcessedPreview(canvas.toDataURL('image/jpeg', 0.9))
      }
  }

  // 3. Handle Scan (OCR)
  const handleScan = async () => {
    if (!processedPreview) return
    setIsScanning(true)
    setText("")
    setProgress(0)
    
    try {
      const worker = await createWorker(language, 1, {
        logger: (m: any) => {
            if (m.status === 'recognizing text') {
                setProgress(m.progress)
                setProgressStatus(`Scanning... ${Math.floor(m.progress * 100)}%`)
            } else {
                setProgressStatus(m.status)
            }
        }
      });
      
      const { data: { text } } = await worker.recognize(processedPreview);
      setText(text);
      await worker.terminate();
    } catch (err) {
      console.error(err)
      setText("Error: Could not scan text. Please ensure the image is clear.")
    } finally {
      setIsScanning(false)
      setProgress(0)
    }
  }

  // 4. Utilities
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
      a.download = `scan-result-${Date.now()}.txt`
      a.click()
  }

  const handleSpeak = () => {
      if (isSpeaking) {
          window.speechSynthesis.cancel()
          setIsSpeaking(false)
          return
      }
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans selection:bg-pink-500/30">
        <SiteHeader />
        
        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight flex items-center justify-center gap-4">
                    <Scan className="text-pink-600" size={48} />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">Pro Vision Scanner</span>
                </h1>
                <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                    Enhance, scan, and extract text from images with AI-powered OCR.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                 
                 {/* LEFT: IMAGE STUDIO */}
                 <div className="lg:col-span-5 space-y-6">
                    <Card className="p-1 bg-muted/50 border-white/10 overflow-hidden rounded-3xl backdrop-blur-md">
                         <div className="p-6 md:p-8 bg-card border-white/5 rounded-[1.4rem] space-y-6">
                             {!file && !isCameraOpen ? (
                                <div className="space-y-4">
                                     <div className="py-12 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer relative">
                                        <FileUploader onFileSelect={(files) => setFile(files[0])} accept="image/*" />
                                        <p className="text-center mt-4 text-muted-foreground font-medium group-hover:text-pink-500 transition-colors">Drop image or click to upload</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                                    </div>
                                    <Button onClick={startCamera} className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold">
                                        <Camera className="mr-2" /> Use Camera
                                    </Button>
                                </div>
                             ) : isCameraOpen ? (
                                 <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                         <Button onClick={stopCamera} variant="secondary" className="rounded-full w-12 h-12 p-0"><X size={20} /></Button>
                                         <Button onClick={captureImage} className="rounded-full w-16 h-16 bg-white border-4 border-zinc-200 p-0 hover:bg-zinc-100 ring-4 ring-pink-500/50"></Button>
                                     </div>
                                 </div>
                             ) : (
                                <>
                                    {/* Preview Area */}
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black group shadow-2xl">
                                        <img src={processedPreview} alt="Processing" className="w-full h-full object-contain" />
                                        
                                        {/* Overlay Controls */}
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button 
                                                onClick={() => { setFile(null); setProcessedPreview(""); setText(""); }}
                                                className="p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-xl backdrop-blur-md transition-all"
                                                title="Remove Image"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Filters & Enhancements */}
                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center gap-2 text-pink-500 font-bold uppercase text-xs tracking-wider">
                                            <Sliders size={14} /> Image Enhancement
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                    <span>Brightness</span>
                                                    <span>{brightness}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="50" max="150" value={brightness} 
                                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-pink-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                    <span>Contrast</span>
                                                    <span>{contrast}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="50" max="150" value={contrast} 
                                                    onChange={(e) => setContrast(Number(e.target.value))}
                                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-pink-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-white/5">
                                            <span className="text-sm font-bold text-muted-foreground">B&W Mode (Best for Docs)</span>
                                            <button 
                                                onClick={() => setGrayscale(!grayscale)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${grayscale ? 'bg-pink-600' : 'bg-muted-foreground/30'}`}
                                            >
                                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${grayscale ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-border/50" />

                                    {/* Scan Controls */}
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <select 
                                                    className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-xl text-sm font-bold appearance-none focus:ring-2 focus:ring-pink-500 outline-none"
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                >
                                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                                </select>
                                                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            </div>
                                            <Button 
                                                onClick={handleScan} 
                                                disabled={isScanning}
                                                className="flex-[2] h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Scan className="mr-2" />}
                                                {isScanning ? "Scanning..." : "extract Text"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                             )}
                         </div>
                    </Card>
                 </div>

                 {/* RIGHT: RESULTS */}
                 <div className="lg:col-span-7 h-full">
                     <Card className="h-full min-h-[600px] p-8 bg-card border-none shadow-2xl rounded-[2.5rem] flex flex-col relative overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 z-10">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                                    <Type size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Extracted Content</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Editable Text Output</p>
                                </div>
                             </div>
                             {text && (
                                 <div className="flex gap-2">
                                     <button onClick={handleSpeak} className={`p-2.5 rounded-xl transition-all ${isSpeaking ? 'bg-pink-100 text-pink-600 animate-pulse' : 'bg-muted hover:bg-pink-50 text-muted-foreground hover:text-pink-600'}`} title="Read Aloud">
                                         {isSpeaking ? <Pause size={18} /> : <Play size={18} />}
                                     </button>
                                    <button onClick={handleCopy} className="p-2.5 rounded-xl bg-muted hover:bg-pink-50 text-muted-foreground hover:text-pink-600 transition-colors" title="Copy">
                                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                    </button>
                                    <button onClick={handleDownload} className="p-2.5 rounded-xl bg-muted hover:bg-pink-50 text-muted-foreground hover:text-pink-600 transition-colors" title="Download">
                                        <Download size={18} />
                                    </button>
                                 </div>
                             )}
                        </div>

                        {/* Text Area */}
                        <div className="flex-1 bg-muted/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/text z-10">
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-foreground leading-7 font-mono text-sm custom-scrollbar"
                                placeholder={isScanning ? "Analyzing image patterns..." : "Extracted text will appear here. You can edit this text directly."}
                                spellCheck={false}
                            />
                            
                            {/* Scanning Overlay Effect */}
                            {isScanning && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 space-y-6">
                                     <div className="relative w-24 h-24">
                                         <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full animate-ping" />
                                         <div className="absolute inset-0 border-4 border-pink-500 rounded-full animate-spin border-t-transparent" />
                                         <Scan className="absolute inset-0 m-auto text-pink-500 animate-pulse" size={32} />
                                     </div>
                                     <div className="space-y-2 text-center w-full max-w-xs">
                                         <p className="text-pink-500 font-bold uppercase tracking-widest text-xs animate-pulse">{progressStatus}</p>
                                         <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                             <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
                                         </div>
                                     </div>
                                </div>
                            )}

                            {!text && !isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                                     <ImageIcon size={64} className="mb-4 text-muted-foreground" />
                                     <p className="font-medium text-lg">Waiting for scan...</p>
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
