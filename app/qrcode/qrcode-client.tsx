"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { SiteHeader } from "@/components/site-header"
import { QrCode, Download, Copy, Check, Palette, Settings, Wifi, Mail, Link as LinkIcon, Type, Image as ImageIcon, Sparkles, Grid3X3 } from "lucide-react"
import QRCode from "qrcode"

export default function QrCodePage() {
  const [content, setContent] = useState("")
  const [activeTab, setActiveTab] = useState("url")
  
  // Customization State
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [useGradient, setUseGradient] = useState(false)
  const [gradientColor, setGradientColor] = useState("#4f46e5") // Indigo default
  const [dotType, setDotType] = useState<"square" | "dots" | "rounded">("square")
  const [logo, setLogo] = useState<string | null>(null)
  
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [copied, setCopied] = useState(false)

  // Wifi State
  const [wifiSsid, setWifiSsid] = useState("")
  const [wifiPass, setWifiPass] = useState("")
  const [wifiEncrypt, setWifiEncrypt] = useState("WPA")

  useEffect(() => {
    generateQr()
  }, [content, activeTab, fgColor, bgColor, useGradient, gradientColor, dotType, logo, wifiSsid, wifiPass, wifiEncrypt])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader()
        reader.onload = (ev) => {
            setLogo(ev.target?.result as string)
        }
        reader.readAsDataURL(e.target.files[0])
    }
  }

  const generateQr = async () => {
      let finalContent = content
      if (activeTab === "wifi") {
          if (!wifiSsid) { setQrDataUrl(""); return }
          finalContent = `WIFI:T:${wifiEncrypt};S:${wifiSsid};P:${wifiPass};;`
      } else if (activeTab === "email") {
          finalContent = `mailto:${content}`
      }

      if (!finalContent) {
          setQrDataUrl("")
          return
      }

      try {
          // 1. Create Raw QR Data
          const qr = await QRCode.create(finalContent, { 
              errorCorrectionLevel: 'H', // High error correction for logos
          })
          
          // 2. Setup Canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const size = 1000
          const padding = 80 // quiet zone
          canvas.width = size
          canvas.height = size
          
          // 3. Draw Background
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, size, size)

          // 4. Calculate Metrics
          const moduleCount = qr.modules.size
          const moduleSize = (size - (padding * 2)) / moduleCount
          
          // 5. Setup Foreground Style (Solid vs Gradient)
          if (useGradient) {
              const gradient = ctx.createLinearGradient(0, 0, size, size)
              gradient.addColorStop(0, fgColor)
              gradient.addColorStop(1, gradientColor)
              ctx.fillStyle = gradient
          } else {
              ctx.fillStyle = fgColor
          }

          // 6. Draw Modules
          const modules = qr.modules.data
          // We need 2D access, module data is 1D array of bit-packed bytes usually, 
          // but qrcode library returns 'modules' object which has .isDark(row, col)
          
          for (let row = 0; row < moduleCount; row++) {
              for (let col = 0; col < moduleCount; col++) {
                   if (qr.modules.get(row, col)) {
                       // Position
                       const x = padding + (col * moduleSize)
                       const y = padding + (row * moduleSize)
                       
                       // Check if center (for logo safety zone)
                       // If logo exists, skip center modules (approx 20% of area)
                       if (logo) {
                           const centerStart = Math.floor(moduleCount * 0.35)
                           const centerEnd = Math.floor(moduleCount * 0.65)
                           if (row >= centerStart && row <= centerEnd && col >= centerStart && col <= centerEnd) {
                               continue
                           }
                       }

                       // Draw Shape
                       ctx.beginPath()
                       if (dotType === 'dots') {
                           const r = moduleSize / 2
                           ctx.arc(x + r, y + r, r, 0, Math.PI * 2)
                           ctx.fill()
                       } else if (dotType === 'rounded') {
                           // Rounded Rect
                           const r = moduleSize * 0.4
                           ctx.roundRect(x, y, moduleSize, moduleSize, r)
                           ctx.fill()
                       } else {
                           // Square (Default)
                           // Fix sub-pixel gaps by adding slight overlap
                           ctx.fillRect(x - 0.5, y - 0.5, moduleSize + 1, moduleSize + 1)
                       }
                   }
              }
          }

          // 7. Draw Logo
          if (logo) {
              const img = new Image()
              img.src = logo
              await new Promise((resolve) => { img.onload = resolve }) // Wait for load
              
              const logoSize = size * 0.22 // 20% of QR size
              const x = (size - logoSize) / 2
              const y = (size - logoSize) / 2
              
              // Draw white background for logo
              ctx.fillStyle = bgColor
              ctx.beginPath()
              ctx.roundRect(x - 10, y - 10, logoSize + 20, logoSize + 20, 20)
              ctx.fill()

              // Draw Logo
              ctx.drawImage(img, x, y, logoSize, logoSize)
          }

          setQrDataUrl(canvas.toDataURL('image/png'))

      } catch (err) {
          console.error(err)
      }
  }

  const handleDownload = () => {
      if (!qrDataUrl) return
      const a = document.createElement("a")
      a.href = qrDataUrl
      a.download = `qrcode-premium-${Date.now()}.png`
      a.click()
  }

  const handleCopy = () => {
      let textToCopy = content
      if (activeTab === "wifi") textToCopy = `WiFi: ${wifiSsid} Pass: ${wifiPass}`
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans">
        <SiteHeader />
        
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-4 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]">
                    <QrCode className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                    Premium QR Studio
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Design unique, branded QR codes with logos, custom shapes, and gradients.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="p-1 bg-muted/50 border-white/10 overflow-hidden rounded-3xl backdrop-blur-md">
                        <Tabs defaultValue="url" onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full h-16 bg-transparent p-1 grid grid-cols-4 gap-1">
                                <TabsTrigger value="url" className="h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:text-black font-bold text-muted-foreground"><LinkIcon className="w-4 h-4 mr-2" /> URL</TabsTrigger>
                                <TabsTrigger value="text" className="h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:text-black font-bold text-muted-foreground"><Type className="w-4 h-4 mr-2" /> Text</TabsTrigger>
                                <TabsTrigger value="email" className="h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:text-black font-bold text-muted-foreground"><Mail className="w-4 h-4 mr-2" /> Email</TabsTrigger>
                                <TabsTrigger value="wifi" className="h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:text-black font-bold text-muted-foreground"><Wifi className="w-4 h-4 mr-2" /> Wi-Fi</TabsTrigger>
                            </TabsList>
                            <div className="p-6 md:p-8 bg-card border-t border-white/5 rounded-b-[1.4rem] space-y-8">
                                {/* TAB CONTENT */}
                                {activeTab === "url" && (
                                    <div className="space-y-2 animate-in fade-in">
                                         <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website URL</Label>
                                         <Input placeholder="https://example.com" value={content} onChange={(e) => setContent(e.target.value)} className="h-14 text-lg border-2 focus-visible:ring-indigo-500 rounded-xl" />
                                    </div>
                                )}
                                {activeTab === "text" && (
                                    <div className="space-y-2 animate-in fade-in">
                                         <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plain Text</Label>
                                         <Input placeholder="Enter Text" value={content} onChange={(e) => setContent(e.target.value)} className="h-14 text-lg border-2 focus-visible:ring-indigo-500 rounded-xl" />
                                    </div>
                                )}
                                {activeTab === "email" && (
                                     <div className="space-y-2 animate-in fade-in">
                                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                                          <Input placeholder="name@domain.com" value={content} onChange={(e) => setContent(e.target.value)} className="h-14 text-lg border-2 focus-visible:ring-indigo-500 rounded-xl" />
                                     </div>
                                )}
                                {activeTab === "wifi" && (
                                    <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in">
                                        <div className="space-y-2">
                                            <Label>SSID</Label>
                                            <Input placeholder="Network Name" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="h-14 border-2 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input type="password" placeholder="Key" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="h-14 border-2 rounded-xl" />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="h-px bg-border" />

                                {/* DESIGN CONTROLS */}
                                <div>
                                    <h3 className="flex items-center gap-2 font-bold mb-6 text-indigo-500"><Palette size={18} /> Design Studio</h3>
                                    
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold uppercase text-muted-foreground">Shape Style</Label>
                                                <div className="flex bg-muted/50 p-1 rounded-xl">
                                                    <button onClick={() => setDotType("square")} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${dotType === 'square' ? 'bg-white shadow-sm text-black' : 'text-muted-foreground'}`}>Square</button>
                                                    <button onClick={() => setDotType("rounded")} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${dotType === 'rounded' ? 'bg-white shadow-sm text-black' : 'text-muted-foreground'}`}>Round</button>
                                                    <button onClick={() => setDotType("dots")} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${dotType === 'dots' ? 'bg-white shadow-sm text-black' : 'text-muted-foreground'}`}>Dots</button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                 <Label className="text-xs font-bold uppercase text-muted-foreground">Logo Embed</Label>
                                                 <label className="flex items-center justify-center h-[50px] border-2 border-dashed border-muted-foreground/30 rounded-xl hover:bg-muted/50 cursor-pointer transition-all">
                                                     <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                     <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                         <ImageIcon size={14} /> {logo ? "Change Logo" : "Upload Logo"}
                                                     </div>
                                                 </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs font-bold uppercase text-muted-foreground">Color & Gradient</Label>
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" id="grad" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="accent-indigo-500" />
                                                    <label htmlFor="grad" className="text-xs font-bold cursor-pointer">Use Gradient</label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                 <div className="flex-1 space-y-2">
                                                     <Label className="text-[10px] uppercase text-muted-foreground">Code Color</Label>
                                                     <div className="flex gap-2">
                                                         <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                                     </div>
                                                 </div>
                                                 {useGradient && (
                                                     <div className="flex-1 space-y-2 animate-in zoom-in-95">
                                                         <Label className="text-[10px] uppercase text-muted-foreground">End Color</Label>
                                                         <div className="flex gap-2">
                                                             <input type="color" value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                                         </div>
                                                     </div>
                                                 )}
                                                 <div className="flex-1 space-y-2">
                                                     <Label className="text-[10px] uppercase text-muted-foreground">Background</Label>
                                                     <div className="flex gap-2">
                                                         <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                                     </div>
                                                 </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tabs>
                    </Card>
                </div>

                {/* PREVIEW PANEL */}
                <div className="lg:col-span-5 relative">
                    <Card className="sticky top-32 p-8 bg-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        
                        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
                            {qrDataUrl ? (
                                <>
                                    <div className="relative group">
                                         <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                                         <img 
                                            src={qrDataUrl} 
                                            alt="QR Code" 
                                            className="relative w-72 h-72 rounded-3xl shadow-2xl transition-transform hover:scale-105 duration-300 p-4 border-2 border-white/10"
                                            style={{ backgroundColor: bgColor }}
                                         />
                                         {logo && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {/* Logo visual reference (it's already baked in but adds depth if we want layers, though image is enough) */}
                                         </div>}
                                    </div>
                                    
                                    <div className="w-full space-y-3">
                                        <Button 
                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
                                            onClick={handleDownload}
                                        >
                                            <Download className="mr-2" /> Download High-Res
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-4 opacity-50">
                                    <QrCode className="w-24 h-24 text-muted-foreground mx-auto" />
                                    <p className="text-lg font-medium">Enter content to visualize</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    </div>
  )
}
