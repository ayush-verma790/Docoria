"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react"
import QRCode from "qrcode"

export default function QrCodePage() {
  const [text, setText] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const generateQr = async (value: string) => {
      setText(value)
      if (!value) {
          setQrDataUrl("")
          return
      }
      try {
          const url = await QRCode.toDataURL(value, {
              width: 400,
              margin: 2,
              color: {
                  dark: '#000000',
                  light: '#ffffff',
              },
          })
          setQrDataUrl(url)
      } catch (err) {
          console.error(err)
      }
  }

  const handleDownload = () => {
      if (!qrDataUrl) return
      const a = document.createElement("a")
      a.href = qrDataUrl
      a.download = `qrcode-${Date.now()}.png`
      a.click()
  }

  const handleCopy = () => {
      if (!text) return
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">
        <SiteHeader />
        
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <QrCode className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    QR Code Generator
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Create instant QR codes for URLs, text, Wi-Fi, and more.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="content" className="text-slate-300 font-bold uppercase text-xs tracking-wider">Content</Label>
                        <Input
                            id="content" 
                            placeholder="Enter URL or text here..." 
                            value={text} 
                            onChange={(e) => generateQr(e.target.value)}
                            className="bg-slate-950 border-white/10 h-14 text-lg text-white placeholder:text-slate-500"
                        />
                        <p className="text-xs text-slate-500">Your QR code will update automatically as you type.</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                         <Button 
                            variant="outline" 
                            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                            onClick={handleCopy}
                            disabled={!text}
                         >
                             {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                             {copied ? "Copied" : "Copy Text"}
                         </Button>
                         <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                            onClick={handleDownload}
                            disabled={!qrDataUrl}
                         >
                             <Download className="w-4 h-4 mr-2" /> Download PNG
                         </Button>
                    </div>
                </Card>

                <div className="flex flex-col items-center justify-center p-8 border border-white/10 bg-white/5 rounded-2xl min-h-[400px]">
                    {qrDataUrl ? (
                         <div className="relative group">
                             <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                             <img 
                                src={qrDataUrl} 
                                alt="QR Code" 
                                className="relative w-64 h-64 rounded-xl border-4 border-white shadow-2xl" 
                             />
                         </div>
                    ) : (
                        <div className="text-center text-slate-500 space-y-4">
                            <div className="w-24 h-24 bg-slate-800 rounded-xl mx-auto flex items-center justify-center border border-white/5">
                                <QrCode className="w-10 h-10 opacity-20" />
                            </div>
                            <p>Enter text to generate preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
