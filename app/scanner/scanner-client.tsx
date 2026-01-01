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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-pink-500/30">
        <SiteHeader />
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        </div>
      <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-4 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                 <Scan className="w-8 h-8 text-pink-500" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                 Text Scanner
             </h1>
             <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                 Copy text from your photos and scans quickly using our smart AI tool.
             </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
             <div className="space-y-6">
                <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                     {!file ? (
                        <div className="py-12">
                            <FileUploader onFileSelect={(files) => setFile(files[0])} accept="image/*" />
                            <p className="text-center mt-6 text-slate-500 text-sm">Supports JPG, PNG, WEBP</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900 group-hover:border-pink-500/50 transition-colors">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                     <span className="text-xs font-medium text-white/70 truncate">{file.name}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button 
                                    onClick={handleScan} 
                                    disabled={isScanning}
                                    className="flex-1 h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:opacity-50"
                                >
                                    {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                                    {isScanning ? "Scanning..." : "Start Scanning"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setFile(null)}
                                    className="border-white/10 text-white hover:bg-white/5 h-12 rounded-xl"
                                >
                                    <RefreshCw className="mr-2" size={18} /> Reselect
                                </Button>
                            </div>
                            {isScanning && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-pink-400 uppercase tracking-widest">
                                        <span>{progressStatus}</span>
                                        <span>{Math.floor(progress * 100)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300" 
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
                 <Card className="h-full min-h-[450px] p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-2">
                            <Type className="text-pink-500" size={18} />
                            <h3 className="font-bold text-slate-300">Extracted Text</h3>
                         </div>
                         {text && (
                             <div className="flex gap-2">
                                <button 
                                    onClick={handleCopy}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Copy Text"
                                >
                                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                                <button 
                                    onClick={handleDownload}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Download TXT"
                                >
                                    <Download size={18} />
                                </button>
                             </div>
                         )}
                    </div>
                    <Textarea 
                        readOnly 
                        value={text} 
                        placeholder="Extracted text will appear here..."
                        className="flex-1 bg-slate-950/50 border-white/5 resize-none focus-visible:ring-pink-500/50 p-6 rounded-xl text-slate-300 leading-relaxed font-mono text-sm"
                    />
                    {!text && !isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none opacity-20">
                             <Type size={48} className="mb-4" />
                             <p className="text-sm">Upload an image and click scan to see the results here.</p>
                        </div>
                    )}
                 </Card>
             </div>
        </div>
      </div>
    </div>
  )
}
