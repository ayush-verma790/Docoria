"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Hammer, Check, Layers } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

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
    <div className="min-h-screen bg-background text-foreground selection:bg-rose-500/30 selection:text-rose-900 font-sans">
        <SiteHeader />
        <div className="max-w-xl mx-auto py-32 px-6">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-sm">
                     <Hammer className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2 tracking-tight">Flatten PDF</h1>
                 <p className="text-muted-foreground">Merge forms and annotations into the page permanently.</p>
            </div>

            <Card className="p-8 bg-card border-border backdrop-blur-xl shadow-lg">
                 {!result ? (
                     <div className="space-y-8">
                         <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                         
                         <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-300 text-sm flex gap-3 shadow-sm">
                             <Layers className="shrink-0 animate-pulse" />
                             <p>Warning: This will make all form fields non-editable. This action cannot be undone.</p>
                         </div>

                         <Button onClick={handleApply} disabled={!file || isProcessing} className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold">
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Flatten Document"}
                         </Button>
                     </div>
                 ) : (
                     <div className="text-center space-y-6">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Flattened Successfully!</h3>
                          <a href={result.downloadUrl} download={result.filename}>
                              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Download PDF</Button>
                          </a>
                          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => {setResult(null); setFile(null)}}>Start Over</Button>
                     </div>
                 )}
            </Card>
        </div>
    </div>
  )
}
