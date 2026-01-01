"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Hammer, Check, Layers } from "lucide-react"

export default function FlattenPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/flatten", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setResult(data)
    } catch (err) {
        alert("Failed to flatten PDF")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500/30">
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
                     <Hammer className="w-8 h-8 text-rose-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">Flatten PDF</h1>
                 <p className="text-slate-400">Merge forms and annotations into the page permanently.</p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl">
                 {!result ? (
                     <div className="space-y-8">
                         <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                         
                         <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm flex gap-3">
                             <Layers className="shrink-0 animate-pulse" />
                             <p>Warning: This will make all form fields non-editable. This action cannot be undone.</p>
                         </div>

                         <Button onClick={handleApply} disabled={!file || isProcessing} className="w-full h-12 bg-rose-600 hover:bg-rose-700 font-bold">
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Flatten Document"}
                         </Button>
                     </div>
                 ) : (
                     <div className="text-center space-y-6">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto" />
                          <h3 className="text-2xl font-bold">Flattened Successfully!</h3>
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
