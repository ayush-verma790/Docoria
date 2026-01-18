"use client"

import { useState, useRef, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileUploader } from "@/components/file-uploader"
import { Bot, Send, User, FileText, Loader2, Key, Info, Trash2, Copy, Check } from "lucide-react"
import { pdfjs } from "react-pdf"
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: "user" | "model"
  content: string
}

function MessageBubble({ msg }: { msg: Message }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
            }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[85%] leading-relaxed text-sm shadow-sm relative group border ${
                msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-none border-primary' 
                : 'bg-card text-card-foreground rounded-tl-none border-border'
            }`}>
                {msg.role === 'model' && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-all opacity-0 group-hover:opacity-100"
                        title="Copy"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                )}
                
                <div className={cn("prose prose-sm max-w-none break-words", msg.role === 'user' ? "prose-invert" : "dark:prose-invert")}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

import { getGlobalFile } from "@/lib/file-store"

export default function ChatClient() {
  const [apiKey, setApiKey] = useState("AIzaSyC4lLnPBVvZJ7AlyM2om_zivy7HyNzDXnM")
  const [hasKey, setHasKey] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [pdfText, setPdfText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

    // Check for global file
    const global = getGlobalFile()
    if (global.file) {
        setFile(global.file)
        extractText(global.file)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

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

  const extractText = async (file: File) => {
    setIsProcessingPdf(true)
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument(arrayBuffer).promise
        let fullText = ""
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(" ")
            fullText += pageText + "\n"
        }
        
        setPdfText(fullText)
        setMessages([{ role: "model", content: `I've read **${file.name}**. What would you like to know about it?` }])
    } catch (err) {
        console.error(err)
        alert("Failed to read PDF. Please try another file.")
        setFile(null)
    } finally {
        setIsProcessingPdf(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !pdfText || !hasKey) return

    const userMessage = input
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        // Construct simplified context window handling
        // We truncate potentially massive PDFs to fit within reasonable prompt limits for the free tier
        const truncatedContext = pdfText.slice(0, 30000) 
        
        const prompt = `
        You are a helpful AI PDF assistant. 
        Context from document:
        """${truncatedContext}"""
        
        User Question: ${userMessage}
        
        Answer based *only* on the provided context. If the answer isn't in the context, say so.
        `

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        setMessages(prev => [...prev, { role: "model", content: response }])
    } catch (err: any) {
        console.error(err)
        setMessages(prev => [...prev, { role: "model", content: `Error: ${err.message || "Failed to generate response."}` }])
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#030014] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white relative">
        
        {/* Background Atmosphere */}
         <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] right-[30%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        <div className="pt-24 pb-10 px-4 max-w-6xl mx-auto h-screen flex flex-col relative z-10">
            {/* Header */}
            <div className="text-center mb-6 shrink-0 space-y-2">
                <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter flex items-center justify-center gap-3">
                    <Bot className="text-purple-400" size={32} /> 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">ChatPDF</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium">Upload a PDF and ask questions using advanced AI.</p>
            </div>

            {!hasKey ? (
                <Card className="max-w-md mx-auto w-full p-8 shadow-2xl border-border">
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                            <Key className="text-primary" size={32} />
                        </div>
                        <h2 className="text-xl font-bold">Enter Gemini API Key</h2>
                        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-xl text-left space-y-2">
                             <p className="flex items-start gap-2"><Info size={16} className="shrink-0 mt-0.5 text-primary" /> This tool runs <strong>entirely in your browser</strong>.</p>
                             <p>Your API key is stored locally on your device and never sent to our servers.</p>
                             <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline block mt-2">Get a free Gemini API Key here &rarr;</a>
                        </div>
                        <div className="space-y-4">
                            <Input 
                                type="password" 
                                placeholder="Paste API Key (starts with AIza...)" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                className="h-12"
                            />
                            <Button onClick={handleSaveKey} disabled={!apiKey} className="w-full h-12 font-bold text-lg">
                                Start Chatting
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    {/* Left: PDF Upload / Status */}
                    <div className="w-80 shrink-0 flex flex-col gap-4 hidden lg:flex">
                        <Card className="p-5 h-full flex flex-col shadow-sm border-border bg-card/50">
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-widest">Document Source</h3>
                                <button onClick={handleClearKey} className="text-xs text-destructive hover:underline flex items-center gap-1">
                                    <Trash2 size={12} /> Clear Key
                                </button>
                            </div>
                            
                            {!file ? (
                                <div className="flex-1 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center p-4">
                                    <div className="w-full">
                                        <FileUploader 
                                            onFileSelect={(files) => {
                                                setFile(files[0])
                                                extractText(files[0])
                                            }} 
                                            accept=".pdf" 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-3">
                                        <FileText className="text-primary shrink-0" size={24} />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setFile(null); setMessages([]); setPdfText(""); }}
                                        className="w-full"
                                    >
                                        Change PDF
                                    </Button>

                                    <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-2">
                                        <p className="font-bold text-foreground">Pro Tips:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Specific questions yield better answers</li>
                                            <li>Ask for summaries or key points</li>
                                            <li>The AI reads the text content directly</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right: Chat Area */}
                    <Card className="flex-1 flex flex-col relative overflow-hidden shadow-sm border-border bg-card">
                        <div className="flex-1 overflow-auto p-6 space-y-8 scroll-smooth" ref={scrollRef as any}>
                            {messages.length === 0 && !isProcessingPdf && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                        <Bot size={40} className="text-muted-foreground/50" />
                                    </div>
                                    <p className="text-lg font-medium">Upload a PDF to start the conversation</p>
                                </div>
                            )}
                            
                            {isProcessingPdf && (
                                <div className="h-full flex flex-col items-center justify-center text-primary space-y-4">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p className="animate-pulse font-medium">Analyzing PDF contents...</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} />
                            ))}
                            
                            {isLoading && (
                                <div className="flex gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                        <Bot size={20} className="text-foreground" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted border border-border rounded-tl-none">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-muted/30 border-t border-border">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2 max-w-3xl mx-auto"
                            >
                                <Input 
                                    className="h-14 bg-background border-input pl-6 pr-14 text-base shadow-sm focus-visible:ring-primary rounded-2xl" 
                                    placeholder={!file ? "Upload a PDF first..." : "Ask something about your document..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={!file || isLoading || isProcessingPdf}
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={!input.trim() || !file || isLoading}
                                    className="absolute right-2 h-10 w-10 rounded-xl"
                                >
                                    <Send size={18} />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    </div>
  )
}
