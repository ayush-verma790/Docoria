"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Sparkles, FileText, Loader2, Key, Info, Copy, Check, Trash2, Clock, List } from "lucide-react"
import { pdfjs } from "react-pdf"
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function SummarizerClient() {
  const [apiKey, setApiKey] = useState("AIzaSyC4lLnPBVvZJ7AlyM2om_zivy7HyNzDXnM")
  const [hasKey, setHasKey] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"concise" | "bullet" | "detailed">("detailed")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Initialize PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const handleSaveKey = () => {
    if (apiKey.trim().length > 0) {
        localStorage.setItem("gemini_api_key", apiKey)
        setHasKey(true)
    }
  }

  const handleClearKey = () => {
      localStorage.removeItem("gemini_api_key")
      setApiKey("")
      setHasKey(false)
  }

  const handleSummarize = async () => {
    if (!file || !hasKey) return
    setIsLoading(true)
    setSummary("")

    try {
        // Extract Text
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument(arrayBuffer).promise
        let fullText = ""
        
        // Limit to first 20 pages for reliable free-tier performance
        const pagesToRead = Math.min(pdf.numPages, 20)
        
        for (let i = 1; i <= pagesToRead; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(" ")
            fullText += pageText + "\n"
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        let promptType = "";
        switch (mode) {
            case "concise": promptType = "a very short, 2-3 sentence summary capturing the absolute core message"; break;
            case "bullet": promptType = "a structured list of key bullet points covering main topics"; break;
            case "detailed": promptType = "a comprehensive summary, explaining major sections and details"; break;
        }

        const prompt = `
        Summarize the following document text into ${promptType}.
        
        Document Text (Truncated if too long):
        """${fullText.slice(0, 30000)}"""
        `

        const result = await model.generateContent(prompt)
        const response = result.response.text()
        setSummary(response)
    } catch (err: any) {
        console.error(err)
        alert(`Error: ${err.message || "Failed to generate summary"}`)
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#030014] text-white font-sans selection:bg-teal-500/30 selection:text-white relative overflow-hidden">
        
        {/* Background Atmosphere */}
         <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="pt-24 pb-10 px-4 max-w-6xl mx-auto min-h-screen flex flex-col relative z-10">
            <div className="text-center mb-10 space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 mb-6 shadow-[0_0_30px_rgba(20,184,166,0.2)] animate-float">
                   <Sparkles className="w-10 h-10 text-teal-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                    AI Summarizer
                </h1>
                <p className="text-gray-400 font-medium max-w-xl mx-auto">Instantly condense long documents into clear, readable summaries using advanced AI.</p>
            </div>

            {!hasKey ? (
               <div className="max-w-md mx-auto w-full p-8 rounded-[2rem] bg-[#0A0A0F]/80 border border-white/10 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 text-center space-y-6">
                        <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/20">
                            <Key className="text-teal-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Enter Gemini API Key</h2>
                        <div className="text-sm text-gray-400 bg-white/5 p-4 rounded-xl text-left space-y-2 border border-white/5">
                             <p>This tool uses Google's advanced Gemini AI models to read your documents.</p>
                             <p>Your API key is stored locally.</p>
                             <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-teal-400 hover:text-teal-300 hover:underline block mt-2 font-medium">Get Free API Key &rarr;</a>
                        </div>
                        <div className="space-y-4">
                            <Input 
                                type="password" 
                                placeholder="Paste API Key (AIza...)" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                className="h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500 rounded-xl"
                            />
                            <Button onClick={handleSaveKey} disabled={!apiKey} className="w-full h-12 bg-teal-600 hover:bg-teal-500 font-bold text-white rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-105">
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-[400px_1fr] gap-8 items-start">
                    {/* Controls Panel */}
                    <div className="space-y-6">
                         <div className="p-6 rounded-3xl bg-[#0A0A0F]/60 border border-white/5 shadow-xl backdrop-blur-md">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Source File</h3>
                                <button onClick={handleClearKey} className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition-colors">
                                    <Trash2 size={12} /> Clear Key
                                </button>
                             </div>
                             
                             {!file ? (
                                <div className="border border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors p-2">
                                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                                </div>
                             ) : (
                                 <div className="space-y-4">
                                     <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-4 group">
                                         <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0 text-teal-400 group-hover:scale-110 transition-transform">
                                             <FileText size={20} />
                                         </div>
                                         <div className="overflow-hidden">
                                             <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                             <p className="text-xs text-gray-400">{Math.round(file.size / 1024)} KB</p>
                                         </div>
                                     </div>
                                     <Button 
                                         variant="ghost" 
                                         onClick={() => { setFile(null); setSummary("") }}
                                         className="w-full h-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                     >
                                         Change File
                                     </Button>
                                 </div>
                             )}
                         </div>

                         <div className="p-6 rounded-3xl bg-[#0A0A0F]/60 border border-white/5 shadow-xl backdrop-blur-md">
                             <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Summary Mode</h3>
                             <div className="space-y-2">
                                 {[
                                     { id: "detailed", label: "Comprehensive", icon: FileText, desc: "Full detail breakdown" },
                                     { id: "bullet", label: "Bullet Points", icon: List, desc: "Key takeaways list" },
                                     { id: "concise", label: "Concise", icon: Clock, desc: "2-3 sentence overview" },
                                 ].map((m) => (
                                     <button
                                        key={m.id}
                                        onClick={() => setMode(m.id as any)}
                                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border ${
                                            mode === m.id 
                                            ? "bg-teal-500/10 border-teal-500/50 text-teal-400 shadow-sm" 
                                            : "bg-white/5 border-transparent hover:bg-white/10 text-gray-400 hover:text-white"
                                        }`}
                                     >
                                        <m.icon size={20} />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">{m.label}</div>
                                            <div className="text-[11px] opacity-70 font-medium">{m.desc}</div>
                                        </div>
                                     </button>
                                 ))}
                             </div>

                             <Button 
                                onClick={handleSummarize}
                                disabled={!file || isLoading}
                                className="w-full mt-6 h-14 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 font-bold text-lg shadow-lg shadow-teal-900/20 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 animate-spin" /> Analyzing...</>
                                ) : (
                                    <>Summarize Document <Sparkles className="ml-2 w-4 h-4" /></>
                                )}
                            </Button>
                         </div>
                    </div>

                    {/* Result Panel */}
                    <div className="h-full min-h-[600px]">
                        <div className="h-full bg-[#0A0A0F]/80 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden flex flex-col backdrop-blur-xl">
                            {!summary ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center pointer-events-none">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                        <Sparkles size={40} className="text-gray-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-white mb-2">Ready to summarize</p>
                                    <p className="text-sm max-w-xs mx-auto leading-relaxed">Upload a document and select a mode to generate an AI-powered summary.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-lg">
                                            <Sparkles size={18} /> Generated Summary
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(summary)
                                                setCopied(true)
                                                setTimeout(() => setCopied(false), 2000)
                                            }}
                                            className="hover:bg-teal-500/10 hover:text-teal-400 text-gray-400 transition-colors"
                                        >
                                            {copied ? <Check size={18} className="text-teal-400" /> : <Copy size={18} />}
                                        </Button>
                                    </div>
                                    <div className="flex-1 p-8 overflow-auto leading-relaxed custom-scrollbar">
                                        <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-teal-400 prose-li:text-gray-300">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {summary}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}
