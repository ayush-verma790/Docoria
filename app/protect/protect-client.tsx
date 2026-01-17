"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Lock, FileText, Check, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"

export default function ProtectPage() {
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

        const res = await fetch("/api/protect", {
            method: "POST",
            body: formData
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        setResult(data)
    } catch (err) {
        console.error(err)
        alert("Failed to protect PDF")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-900 font-sans">
        <SiteHeader />
        
        {/* Background Ambience - Subtle for theme compatibility */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-lg mx-auto relative z-10 py-32 px-6">
        
        <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm mb-6">
                 <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight mb-2">Protect PDF</h1>
             <p className="text-muted-foreground">Encrypt your documents with military-grade AES encryption.</p>
        </div>

        <Card className="p-8 bg-card border-border backdrop-blur-xl shadow-xl relative overflow-hidden">
             
             {/* Scanning Line Animation on Card */}
             {isProcessing && (
                 <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-20 -translate-y-full"
                    animate={{ top: ["0%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
             )}

             {!result ? (
                 <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">1. Upload Document</label>
                        <FileUploader 
                            onFileSelect={(files) => setFile(files[0])} 
                            accept=".pdf" 
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">2. Set Password</label>
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a strong password"
                                className="bg-background border-input pr-10 h-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                     </div>

                     <Button 
                        onClick={handleApply}
                        disabled={!file || !password || isProcessing}
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                     >
                        {isProcessing ? (
                            <><Loader2 className="animate-spin mr-2" /> Encrypting...</>
                        ) : (
                            <><Lock className="mr-2 w-5 h-5" /> Lock Document</>
                        )}
                     </Button>
                 </div>
             ) : (
                 <div className="py-8 text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto ring-1 ring-emerald-500/50">
                          <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">File Protected!</h3>
                          <p className="text-muted-foreground text-sm">Your document is now encrypted and safe.</p>
                      </div>

                      <a href={result.downloadUrl} download={result.filename} className="block w-full">
                          <Button className="w-full h-14 bg-foreground text-background font-bold hover:bg-foreground/90">
                              <Download className="mr-2" /> Download Secured PDF
                          </Button>
                      </a>
                      
                       <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => {setResult(null); setPassword(""); setFile(null);}}>
                          Encrypt Another File
                      </Button>
                 </div>
             )}
        </Card>

      </div>
    </div>
  )
}
