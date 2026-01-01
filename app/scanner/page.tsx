"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { Scan, Type, Copy, Check, Download, Loader2, Sparkles, RefreshCw } from "lucide-react"
import { createWorker } from "tesseract.js"

export default function ScannerPage() {
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
      
    //   await worker.loadLanguage('eng');
    //   await worker.initialize('eng');
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
        
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        </div>

      <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Header Section */}
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

        <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <Card className="p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden h-full flex flex-col">
                <div className="space-y-6 flex-1">
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">1</span> Upload Image
                        </h2>
                        <FileUploader 
                            onFileSelect={(files) => setFile(files[0] || null)} 
                            accept=".jpg,.jpeg,.png,.webp,.bmp"
                        />
                    </div>

                    {file && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
                                {/* Scan Line Animation */}
                                {isScanning && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_#ec4899] animate-scan z-10 opactiy-80"></div>
                                )}
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                            
                            <Button 
                                onClick={handleScan}
                                disabled={isScanning}
                                className="w-full h-14 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> {progressStatus || "Initializing..."}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 w-5 h-5" /> Read Text Now
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Output Section */}
            <Card className={`p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative h-full flex flex-col transition-all duration-500 ${!text && "opacity-50"}`}>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">2</span> The Text Found
                    </h2>
                    {text && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs h-8 border-white/10 hover:bg-white/5">
                                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setText("")} className="text-xs h-8 hover:text-red-400">
                                Clear
                            </Button>
                        </div>
                    )}
                 </div>

                 <div className="flex-1 min-h-[400px] relative">
                     <Textarea 
                        value={text} 
                        readOnly 
                        placeholder={isScanning ? "Scanning document..." : "Text result will appear here..."}
                        className="w-full h-full min-h-[400px] bg-slate-950/50 border-white/10 text-slate-200 resize-none p-6 font-mono text-sm leading-relaxed focus:ring-pink-500/20 focus:border-pink-500/40"
                     />
                     
                     {text && (
                         <div className="absolute bottom-4 right-4 animate-in zoom-in">
                             <Button onClick={handleDownload} className="bg-white text-slate-950 hover:bg-slate-200 font-bold shadow-lg">
                                 <Download className="mr-2 w-4 h-4" /> Download .txt
                             </Button>
                         </div>
                     )}
                 </div>
            </Card>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
