"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Lock, FileText, Check, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 selection:text-emerald-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-20%] w-[1000px] h-[1000px] bg-slate-800/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Floating Icons */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-20 text-emerald-500/20 pointer-events-none">
            <Lock size={64} />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-20 right-20 text-slate-500/10 pointer-events-none">
            <ShieldCheck size={96} />
        </motion.div>


      <div className="w-full max-w-lg relative z-10">
        
        <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 mb-6">
                 <Lock className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-2">Protect PDF</h1>
             <p className="text-slate-300">Encrypt your documents with military-grade AES encryption.</p>
        </div>

        <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
             
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
                        <label className="text-sm font-medium text-slate-300">1. Upload Document</label>
                        <FileUploader 
                            onFileSelect={(files) => setFile(files[0])} 
                            accept=".pdf" 
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">2. Set Password</label>
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a strong password"
                                className="bg-slate-950 border-white/10 pr-10 h-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-white"
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
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto ring-1 ring-emerald-500/50">
                          <Check className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-white mb-2">File Protected!</h3>
                          <p className="text-slate-400 text-sm">Your document is now encrypted and safe.</p>
                      </div>

                      <a href={result.downloadUrl} download={result.filename} className="block w-full">
                          <Button className="w-full h-14 bg-white text-slate-900 font-bold hover:bg-slate-200">
                              <Download className="mr-2" /> Download Secured PDF
                          </Button>
                      </a>
                      
                       <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => {setResult(null); setPassword(""); setFile(null);}}>
                          Encrypt Another File
                      </Button>
                 </div>
             )}
        </Card>

      </div>
    </div>
  )
}
