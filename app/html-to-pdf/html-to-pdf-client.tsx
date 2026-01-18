"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Globe, Check, Eye } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { motion } from "framer-motion"

export default function HtmlToPdfClient() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)
  
  const handleConvert = async () => {
    if (!url) return
    setIsProcessing(true)
    
    try {
        const res = await fetch("/api/html-to-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        })
        
        if (!res.ok) throw new Error("Conversion failed")
        
        const blob = await res.blob()
        const downloadUrl = URL.createObjectURL(blob)
        setResult({
            downloadUrl,
            filename: `webpage-${new Date().getTime()}.pdf`
        })
    } catch (err) {
        alert("Failed to convert URL to PDF. Please ensure the URL is valid and public.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
        <SiteHeader />
        
        <div className="max-w-4xl mx-auto py-32 px-6">
            <div className="text-center mb-16">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 mb-8 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                     <Globe className="w-10 h-10 text-cyan-500" />
                 </div>
                 <h1 className="text-5xl font-black italic tracking-tighter mb-4 uppercase">Webpage to PDF</h1>
                 <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                    Convert any public URL into a high-quality PDF document with perfect formatting.
                 </p>
            </div>

            <Card className="p-10 bg-slate-900/40 border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                 {!result ? (
                     <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Target URL</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <Input 
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="h-16 pl-12 bg-slate-950/50 border-white/10 text-lg rounded-2xl focus:ring-cyan-500/50"
                                />
                            </div>
                         </div>

                         <div className="grid sm:grid-cols-2 gap-4">
                             <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                 <h4 className="font-bold text-slate-200">Full Page Render</h4>
                                 <p className="text-xs text-slate-400">We capture the entire length of the webpage, not just the visible part.</p>
                             </div>
                             <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                 <h4 className="font-bold text-slate-200">CSS Support</h4>
                                 <p className="text-xs text-slate-400">Preserves fonts, images, and layout as seen in modern browsers.</p>
                             </div>
                         </div>

                         <Button 
                            onClick={handleConvert}
                            disabled={!url || isProcessing}
                            className="w-full h-16 bg-cyan-600 hover:bg-cyan-500 text-xl font-black italic rounded-2xl shadow-xl shadow-cyan-500/20 transition-all"
                         >
                            {isProcessing ? <Loader2 className="animate-spin mr-3" size={24} /> : "CONVERT TO PDF"}
                         </Button>
                     </div>
                 ) : (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-10 py-6"
                     >
                          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                               <Check className="w-12 h-12 text-emerald-500" />
                          </div>
                          <div className="space-y-2">
                               <h3 className="text-3xl font-black italic">CONVERSION COMPLETE</h3>
                               <p className="text-slate-300">The webpage has been transformed into a portable PDF file.</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                              <a href={result.downloadUrl} download={result.filename} className="flex-1">
                                  <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-lg font-black italic rounded-2xl">
                                      <Download className="mr-2" /> DOWNLOAD PDF
                                  </Button>
                              </a>
                              <Button variant="ghost" className="h-16 px-8 rounded-2xl text-slate-400 hover:text-white" onClick={() => {setResult(null); setUrl("")}}>Convert Another</Button>
                          </div>
                     </motion.div>
                 )}
            </Card>

            <div className="mt-12 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10">
                <h4 className="font-bold mb-4 flex items-center gap-2 italic">
                    <Eye size={18} className="text-indigo-400" /> PRO HINT
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                    URLs requiring login (like your Facebook profile or bank statement) cannot be converted directly for privacy reasons. 
                    For those, we recommend using our <strong>Browser Extension</strong> or printing to PDF manually from your browser.
                </p>
            </div>
        </div>
    </div>
  )
}
