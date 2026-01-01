"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Tag, Check, User, FileType, Search } from "lucide-react"

export default function MetadataPage() {
  const [file, setFile] = useState<File | null>(null)
  
  // Metadata Fields
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [subject, setSubject] = useState("")
  const [keywords, setKeywords] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", title)
        formData.append("author", author)
        formData.append("subject", subject)
        formData.append("keywords", keywords)

        const res = await fetch("/api/metadata", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setResult(data)
    } catch (err) {
        alert("Failed to update metadata")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-6">
                     <Tag className="w-8 h-8 text-purple-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">Metadata Editor</h1>
                 <p className="text-slate-400">Modify invisible file properties like Author and Title.</p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl">
                 {!result ? (
                     <div className="space-y-6">
                         <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                         
                         {file && (
                             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                     <div className="relative">
                                         <FileType className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                         <Input value={title} onChange={e => setTitle(e.target.value)} className="pl-10 bg-slate-950 border-white/10" placeholder="My Document" />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                                     <div className="relative">
                                         <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                         <Input value={author} onChange={e => setAuthor(e.target.value)} className="pl-10 bg-slate-950 border-white/10" placeholder="John Doe" />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-1">Keywords</label>
                                     <div className="relative">
                                         <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                         <Input value={keywords} onChange={e => setKeywords(e.target.value)} className="pl-10 bg-slate-950 border-white/10" placeholder="finance, report, Q1" />
                                     </div>
                                 </div>
                             </div>
                         )}

                         <Button onClick={handleApply} disabled={!file || isProcessing} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold">
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Save Metadata"}
                         </Button>
                     </div>
                 ) : (
                     <div className="text-center space-y-6">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto" />
                          <h3 className="text-2xl font-bold">Updated Successfully!</h3>
                          <a href={result.downloadUrl} download={result.filename}>
                              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">Download PDF</Button>
                          </a>
                          <Button variant="ghost" onClick={() => {setResult(null); setFile(null); setTitle(""); setAuthor(""); setKeywords("")}}>Start Over</Button>
                     </div>
                 )}
            </Card>
        </div>
    </div>
  )
}
