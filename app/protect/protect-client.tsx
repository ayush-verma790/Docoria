"use client"

import { useState, useEffect } from "react"
import { PDFDocument, StandardFonts } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Lock, FileText, Check, Eye, EyeOff, ShieldCheck, Key, Shield, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function ProtectClient() {
  const [file, setFile] = useState<File | null>(null)
  
  // Security Settings
  const [userPassword, setUserPassword] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("") 
  const [showPassword, setShowPassword] = useState(false)
  
  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(false)
  const [allowCopying, setAllowCopying] = useState(false)
  const [allowModifying, setAllowModifying] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleApply = async () => {
    if (!file || !userPassword) return
    setIsProcessing(true)
    
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Apply Encryption
        (pdfDoc as any).encrypt({
            userPassword: userPassword,
            ownerPassword: ownerPassword || userPassword, // Fallback to user password if owner not set
            permissions: {
                printing: allowPrinting ? 'highResolution' : undefined, // 'highResolution' or undefined basically
                copying: allowCopying,
                modifying: allowModifying,
                fillingForms: allowModifying,
                annotating: allowModifying,
                contentAccessibility: allowCopying, 
                documentAssembly: allowModifying
            }
        })
        
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        setResult({
            downloadUrl: url,
            filename: `protected-${file.name}`
        })
        
    } catch (err) {
        console.error(err)
        alert("Failed to protect PDF. Please try again.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020402] text-white selection:bg-emerald-500/30 selection:text-white font-sans overflow-hidden">
        <SiteHeader />
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-900/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                     <ShieldCheck className="w-4 h-4" />
                     <span>Secure Vault Studio</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white">Encrypt & <span className="text-emerald-500">Secure</span></h1>
                 <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                     Bank-grade encryption performed locally on your device. Zero data upload.
                 </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                 {/* Main Column */}
                 <div className="lg:col-span-2">
                     <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-emerald-500/20 to-transparent">
                         <div className="bg-[#0A0A0F]/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                             {/* Scan Line */}
                             {isProcessing && (
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-20 -translate-y-full pointer-events-none z-10"
                                    animate={{ top: ["0%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                             )}

                             {!result ? (
                                 <div className="space-y-8 relative z-20">
                                     <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs">1</span>
                                            File Selection
                                        </h3>
                                        {!file ? (
                                            <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                        ) : (
                                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
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
                                                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs">2</span>
                                                Encryption Keys
                                            </h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-300">Open Password <span className="text-red-400">*</span></Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type={showPassword ? "text" : "password"}
                                                            value={userPassword}
                                                            onChange={(e) => setUserPassword(e.target.value)}
                                                            className="bg-black/40 border-white/10 focus:border-emerald-500 pl-10 h-12 rounded-xl text-lg tracking-wider"
                                                            placeholder="User Password"
                                                        />
                                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">Required to view the file.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gray-300">Owner Password <span className="text-gray-500">(Optional)</span></Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type={showPassword ? "text" : "password"}
                                                            value={ownerPassword}
                                                            onChange={(e) => setOwnerPassword(e.target.value)}
                                                            className="bg-black/40 border-white/10 focus:border-emerald-500 pl-10 h-12 rounded-xl text-lg tracking-wider"
                                                            placeholder="Master Password"
                                                        />
                                                        <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">Required to change permissions.</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                                                    {showPassword ? "Hide Passwords" : "Show Passwords"}
                                                </button>
                                            </div>
                                         </div>

                                         <div className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
                                             <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                                 <Shield className="w-4 h-4 text-emerald-500" /> Permissions Restrictions
                                             </h3>
                                             <div className="space-y-4">
                                                 <div className="flex items-center justify-between">
                                                     <div className="space-y-0.5">
                                                         <Label className="text-white">Allow Printing</Label>
                                                         <p className="text-xs text-gray-500">Enable high-quality printing</p>
                                                     </div>
                                                     <Switch checked={allowPrinting} onCheckedChange={setAllowPrinting} className="data-[state=checked]:bg-emerald-500" />
                                                 </div>
                                                 <div className="flex items-center justify-between">
                                                     <div className="space-y-0.5">
                                                         <Label className="text-white">Allow Content Copying</Label>
                                                         <p className="text-xs text-gray-500">Select and copy text/images</p>
                                                     </div>
                                                     <Switch checked={allowCopying} onCheckedChange={setAllowCopying} className="data-[state=checked]:bg-emerald-500" />
                                                 </div>
                                                 <div className="flex items-center justify-between">
                                                     <div className="space-y-0.5">
                                                         <Label className="text-white">Allow Modifications</Label>
                                                         <p className="text-xs text-gray-500">Edit content, fill forms, annotate</p>
                                                     </div>
                                                     <Switch checked={allowModifying} onCheckedChange={setAllowModifying} className="data-[state=checked]:bg-emerald-500" />
                                                 </div>
                                             </div>
                                         </div>

                                         <Button 
                                            onClick={handleApply}
                                            disabled={!file || !userPassword || isProcessing}
                                            className="w-full h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-lg rounded-xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isProcessing ? (
                                                <><Loader2 className="animate-spin mr-2" /> Encrypting Vault...</>
                                            ) : (
                                                <><Lock className="mr-2 w-5 h-5 fill-white/20" /> Protect Document</>
                                            )}
                                        </Button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                      <div className="relative w-32 h-32 mx-auto">
                                          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                                          <div className="relative z-10 w-full h-full bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                              <ShieldCheck className="w-16 h-16 text-emerald-400" />
                                          </div>
                                      </div>
                                      
                                      <div>
                                          <h3 className="text-3xl font-black text-white mb-2">Secured Successfully!</h3>
                                          <p className="text-gray-400">Your document is now locked with 128-bit AES encryption.</p>
                                      </div>

                                      <div className="flex flex-col gap-4">
                                        <a href={result.downloadUrl} download={result.filename} className="block w-full">
                                            <Button className="w-full h-14 bg-white text-emerald-950 font-black text-lg hover:bg-emerald-50 rounded-xl shadow-xl">
                                                <Download className="mr-2" strokeWidth={3} /> Download Secured PDF
                                            </Button>
                                        </a>
                                        <Button variant="ghost" onClick={() => {setResult(null); setUserPassword(""); setFile(null);}} className="text-gray-400 hover:text-white">
                                            Protect Another
                                        </Button>
                                      </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Right Info Column */}
                 <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                         <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                             <Lock className="w-4 h-4 text-emerald-500" /> Why use this?
                         </h3>
                         <ul className="space-y-4">
                             <li className="flex gap-3 text-sm text-gray-400">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                 Privacy First: File never leaves your browser.
                             </li>
                             <li className="flex gap-3 text-sm text-gray-400">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                 Instant Encryption: No upload/download wait times.
                             </li>
                             <li className="flex gap-3 text-sm text-gray-400">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                 Granular Control: Restrict printing and copying.
                             </li>
                         </ul>
                     </div>

                     <div className="p-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md">
                         <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                             <AlertTriangle className="w-4 h-4" /> Important
                         </h3>
                         <p className="text-xs text-yellow-200/80 leading-relaxed">
                             If you lose the User Password, the file cannot be opened. We do not store your passwords or files, so recovery is impossible.
                         </p>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  )
}
