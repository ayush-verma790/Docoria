"use client"

import { useState, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Unlock, FileText, Check, Eye, EyeOff, ShieldAlert, KeyRound, LockOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function UnlockClient() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  const [error, setError] = useState("")
  
  const handleApply = async () => {
    if (!file || !password) return
    setIsProcessing(true)
    setError("")
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        
        // Load encrypted doc
        let srcDoc;
        try {
             srcDoc = await PDFDocument.load(arrayBuffer, { password: password } as any)
        } catch (e) {
            console.error(e)
            throw new Error("Incorrect password or file is not encrypted.")
        }
        
        // Create clean doc to strip everything
        const newDoc = await PDFDocument.create()
        const indices = srcDoc.getPageIndices()
        const copiedPages = await newDoc.copyPages(srcDoc, indices)
        
        copiedPages.forEach((page) => newDoc.addPage(page))
        
        const pdfBytes = await newDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        setResult({
            downloadUrl: url,
            filename: `unlocked-${file.name}`
        })
        
    } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to unlock PDF")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#070202] text-white selection:bg-orange-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                     <LockOpen className="w-4 h-4" />
                     <span>Unlock Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white">Remove <span className="text-orange-500">Restrictions</span></h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                     Instantly decrypt and save your PDF without passwords. Secure client-side processing.
                 </p>
            </div>

            <div className="max-w-2xl mx-auto">
                 <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-orange-500/20 to-transparent">
                     <div className="bg-[#0A0A0F]/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                         
                         {isProcessing && (
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent h-20 -translate-y-full pointer-events-none z-10"
                                animate={{ top: ["0%", "200%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                         )}

                         {!result ? (
                             <div className="space-y-8 relative z-20">
                                 <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs">1</span>
                                        Locked File
                                    </h3>
                                    {!file ? (
                                        <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                    ) : (
                                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white truncate max-w-[200px]">{file.name}</div>
                                                    <div className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setFile(null)}>Change</Button>
                                        </div>
                                    )}
                                 </div>

                                 <div className={cn("space-y-6 transition-all duration-500", !file && "opacity-50 grayscale pointer-events-none")}>
                                     <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs">2</span>
                                            Current Password
                                        </h3>
                                        
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-black/40 border-white/10 focus:border-orange-500 pl-10 h-14 rounded-xl text-lg tracking-wider"
                                                placeholder="Enter password..."
                                            />
                                            <KeyRound className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-4 text-gray-500 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500">We use this to open the file locally. It is never sent to any server.</p>
                                     </div>
                                     
                                     {error && (
                                         <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                             <ShieldAlert className="w-5 h-5 shrink-0" />
                                             {error}
                                         </div>
                                     )}

                                     <Button 
                                        onClick={handleApply}
                                        disabled={!file || !password || isProcessing}
                                        className="w-full h-16 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-lg rounded-xl shadow-[0_10px_40px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isProcessing ? (
                                            <><Loader2 className="animate-spin mr-2" /> Unlocking...</>
                                        ) : (
                                            <><Unlock className="mr-2 w-5 h-5 fill-white/20" /> Unlock Document</>
                                        )}
                                    </Button>
                                 </div>
                             </div>
                         ) : (
                             <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                  <div className="relative w-32 h-32 mx-auto">
                                      <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
                                      <div className="relative z-10 w-full h-full bg-orange-500/10 rounded-full border border-orange-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.3)]">
                                          <LockOpen className="w-16 h-16 text-orange-400" />
                                      </div>
                                  </div>
                                  
                                  <div>
                                      <h3 className="text-3xl font-black text-white mb-2">Unlocked!</h3>
                                      <p className="text-gray-400">Password and restrictions successfully removed.</p>
                                  </div>

                                  <div className="flex flex-col gap-4">
                                    <a href={result.downloadUrl} download={result.filename} className="block w-full">
                                        <Button className="w-full h-14 bg-white text-orange-950 font-black text-lg hover:bg-orange-50 rounded-xl shadow-xl">
                                            <Download className="mr-2" strokeWidth={3} /> Download Unlocked PDF
                                        </Button>
                                    </a>
                                    <Button variant="ghost" onClick={() => {setResult(null); setPassword(""); setFile(null); setError("");}} className="text-gray-400 hover:text-white">
                                        Unlock Another
                                    </Button>
                                  </div>
                             </div>
                         )}
                     </div>
                 </div>
            </div>
        </div>
    </div>
  )
}
