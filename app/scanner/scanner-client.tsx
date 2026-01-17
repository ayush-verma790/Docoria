"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { Scan, Type, Copy, Check, Download, Loader2, Sparkles, RefreshCw } from "lucide-react"
import { createWorker } from "tesseract.js"

export default function ScannerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [text, setText] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
        setPreview("")
    }
  }, [file])

  const handleScan = async () => {
    if (!file) return
    setIsScanning(true)
    setText("")
    setProgress(0)
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
            if (m.status === 'recognizing text') {
                setProgress(m.progress)
                setProgressStatus(`Recognizing... ${Math.floor(m.progress * 100)}%`)
            } else {
                setProgressStatus(m.status)
            }
        }
      });
      const { data: { text } } = await worker.recognize(file);
      setText(text);
      await worker.terminate();
    } catch (err) {
      console.error(err)
      setText("Error: Could not scan text. Please try a clearer image.")
    } finally {
      setIsScanning(false)
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
      a.download = `scanned-text-${Date.now()}.txt`
      a.click()
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
        <SiteHeader />
        
        <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto min-h-screen flex flex-col">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight flex items-center justify-center gap-3">
                    <Scan className="text-pink-600" size={40} />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">Text Scanner</span>
                </h1>
                <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
                     Copy text from your photos and scans quickly using our smart AI tool.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                 <div className="space-y-6">
                    <Card className="p-8 shadow-sm border-border bg-card relative overflow-hidden group">
                         {!file ? (
                            <div className="py-12 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                <FileUploader onFileSelect={(files) => setFile(files[0])} accept="image/*" />
                                <p className="text-center mt-6 text-muted-foreground text-sm font-medium">Supports JPG, PNG, WEBP</p>
                            </div>
                         ) : (
                            <div className="space-y-6">
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50 group-hover:border-pink-500/50 transition-colors">
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                         <span className="text-xs font-medium text-white truncate">{file.name}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button 
                                        onClick={handleScan} 
                                        disabled={isScanning}
                                        className="flex-1 h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg shadow-lg disabled:opacity-50"
                                    >
                                        {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                                        {isScanning ? "Scanning..." : "Start Scanning"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setFile(null)}
                                        className="h-12 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                    >
                                        <RefreshCw className="mr-2" size={18} /> Reselect
                                    </Button>
                                </div>
                                {isScanning && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-pink-600 uppercase tracking-widest">
                                            <span>{progressStatus}</span>
                                            <span>{Math.floor(progress * 100)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300" 
                                                style={{ width: `${progress * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                         )}
                    </Card>
                 </div>

                 <div className="space-y-6 h-full">
                     <Card className="h-full min-h-[450px] p-8 shadow-sm border-border bg-card flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-2">
                                <Type className="text-pink-600" size={18} />
                                <h3 className="font-bold text-foreground">Extracted Text</h3>
                             </div>
                             {text && (
                                 <div className="flex gap-2">
                                    <button 
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg bg-muted hover:bg-pink-50 text-muted-foreground hover:text-pink-600 transition-colors"
                                        title="Copy Text"
                                    >
                                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        className="p-2 rounded-lg bg-muted hover:bg-pink-50 text-muted-foreground hover:text-pink-600 transition-colors"
                                        title="Download TXT"
                                    >
                                        <Download size={18} />
                                    </button>
                                 </div>
                             )}
                        </div>
                        {/* Formatted Text Display */}
                        <div className="flex-1 bg-muted/30 border border-border rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute inset-0 overflow-auto custom-scrollbar p-6">
                                {text ? (
                                    <p className="text-foreground leading-7 font-sans whitespace-pre-wrap text-sm">
                                        {text}
                                    </p>
                                ) : (
                                    <span className="text-muted-foreground/60 italic">Extracted text will appear here...</span>
                                )}
                            </div>
                        </div>
                        {!text && !isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none opacity-20">
                                 <Type size={48} className="mb-4 text-muted-foreground" />
                                 <p className="text-sm text-muted-foreground">Upload an image and click scan to see the results here.</p>
                            </div>
                        )}
                     </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}
