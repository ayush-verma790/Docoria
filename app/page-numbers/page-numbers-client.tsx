"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Hash, AlignCenter, AlignLeft, AlignRight, Check } from "lucide-react"

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState("bottom-center")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("position", position)

        const res = await fetch("/api/page-numbers", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setResult(data)
    } catch (err) {
        alert("Failed to add numbers")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                     <Hash className="w-8 h-8 text-blue-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">Add Page Numbers</h1>
                 <p className="text-slate-400">Number every page of your document in seconds.</p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl">
                 {!result ? (
                     <div className="space-y-8">
                         <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                         
                         <div className="space-y-3">
                             <label className="text-sm font-medium text-slate-300">Position</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {[
                                     { id: "bottom-left", icon: AlignLeft, label: "Left" },
                                     { id: "bottom-center", icon: AlignCenter, label: "Center" },
                                     { id: "bottom-right", icon: AlignRight, label: "Right" },
                                 ].map((opt) => (
                                     <button
                                        key={opt.id}
                                        onClick={() => setPosition(opt.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${position === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                                     >
                                         <opt.icon size={20} />
                                         <span className="text-xs font-medium">{opt.label}</span>
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <Button onClick={handleApply} disabled={!file || isProcessing} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold">
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Add Numbers"}
                         </Button>
                     </div>
                 ) : (
                     <div className="text-center space-y-6">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto" />
                          <h3 className="text-2xl font-bold">Numbers Added!</h3>
                          <a href={result.downloadUrl} download={result.filename}>
                              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">Download PDF</Button>
                          </a>
                          <Button variant="ghost" onClick={() => {setResult(null); setFile(null)}}>Start Over</Button>
                     </div>
                 )}
            </Card>
        </div>
    </div>
  )
}
