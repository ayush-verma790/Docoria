"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Unlock, FileText, Check, Eye, EyeOff, ShieldAlert } from "lucide-react" // Unlock icon
import { motion } from "framer-motion"

export default function UnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file || !password) return
    setIsProcessing(true)
    
    try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("password", password)

        const res = await fetch("/api/unlock", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        setResult(data)
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to unlock PDF")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30 selection:text-orange-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-lg relative z-10">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                     <Unlock className="w-8 h-8 text-orange-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">Unlock PDF</h1>
                 <p className="text-slate-300">Remove passwords and restrictions permanently.</p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl">
                 {!result ? (
                     <div className="space-y-6">
                         <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                         
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Enter Document Password</label>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                     className="bg-slate-950 border-white/10 pr-10 text-white placeholder:text-slate-500"
                                     placeholder="Required to open the file"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                         </div>

                         <Button 
                            onClick={handleApply}
                            disabled={!file || !password || isProcessing}
                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-bold"
                         >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Unlock className="mr-2 w-4 h-4" />}
                            Unlock PDF
                         </Button>
                     </div>
                 ) : (
                     <div className="text-center space-y-6 py-6">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto" />
                          <h3 className="text-2xl font-bold">Unlocked Successfully!</h3>
                          <a href={result.downloadUrl} download={result.filename}>
                              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">Download Unlocked PDF</Button>
                          </a>
                           <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => {setResult(null); setPassword(""); setFile(null)}}>Unlock Another</Button>
                     </div>
                 )}
            </Card>
        </div>
    </div>
  )
}
