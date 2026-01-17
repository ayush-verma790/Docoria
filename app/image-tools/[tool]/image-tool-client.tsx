"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { 
    Eraser, User, Image as ImageIcon, Zap, Camera, Crop, 
    CreditCard, Aperture, Type, Palette, ArrowRight, Download, RefreshCw, CheckCircle 
} from "lucide-react"
import Link from "next/link"

const TOOLS: Record<string, { title: string; desc: string; icon: any; color: string }> = {
    "bg-remover": { title: "Background Remover", desc: "Remove image background instantly (AI)", icon: Eraser, color: "text-pink-500" },
    "passport": { title: "Passport Photo Maker", desc: "Create 3.5x4.5cm standard photos", icon: User, color: "text-blue-500" },
    "resize": { title: "Image Resizer", desc: "Change dimensions in pixels or %", icon: ImageIcon, color: "text-purple-500" },
    "profile": { title: "Profile Picture Maker", desc: "Create rounded social media avatars", icon: Camera, color: "text-orange-500" },
    "blur": { title: "Blur Image", desc: "Blur sensitive parts of an image", icon: Palette, color: "text-emerald-500" },
    "crop": { title: "Image Cropper", desc: "Crop images to specific ratios", icon: Crop, color: "text-cyan-500" },
    "id-card": { title: "ID Card Maker", desc: "Simple ID Layout", icon: CreditCard, color: "text-indigo-500" },
}

export default function ImageToolClient({ tool }: { tool: string }) {
    const config = TOOLS[tool] || TOOLS["resize"]
    const [file, setFile] = useState<File | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [settings, setSettings] = useState({ 
        blur: 5, 
        width: 100, 
        height: 100, 
        watermarkText: "Confidential",
        compressionQuality: 0.8,
        idName: "John Doe",
        bgThreshold: 240
    })
    
    // Canvas refs
    const originalImageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
            setProcessedImage(null)
            
            // Immediately load dimensions
            const img = new Image()
            const objectUrl = URL.createObjectURL(files[0])
            img.src = objectUrl
            img.onload = () => {
               setSettings(s => ({ ...s, width: img.naturalWidth, height: img.naturalHeight }))
            }
        }
    }

    const processImage = async () => {
        if (!file) return
        setIsProcessing(true)
        await new Promise(r => setTimeout(r, 800)) // Slight delay for UX

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise(r => img.onload = r)

        if (tool === "passport") {
            // Passport Logic (3.5 x 4.5 cm ~ 7:9 ratio)
            const ratio = 3.5 / 4.5
            let w = img.width
            let h = img.height
            if (w / h > ratio) { w = h * ratio } else { h = w / ratio }
            canvas.width = 413 // ~3.5cm at 300dpi
            canvas.height = 531 // ~4.5cm at 300dpi
            const offsetX = (img.width - w) / 2
            const offsetY = (img.height - h) / 2
            ctx.drawImage(img, offsetX, offsetY, w, h, 0, 0, canvas.width, canvas.height)
            
        } else if (tool === "profile") {
            // Circle Crop
            const size = Math.min(img.width, img.height)
            canvas.width = size
            canvas.height = size
            const offsetX = (img.width - size) / 2
            const offsetY = (img.height - size) / 2
            
            ctx.beginPath()
            ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size)
            
        } else if (tool === "blur") {
             canvas.width = img.width
             canvas.height = img.height
             ctx.filter = `blur(${settings.blur}px)`
             ctx.drawImage(img, 0, 0)
             
        } else if (tool === "resize") {
             // Explicit Resize
             canvas.width = settings.width
             canvas.height = settings.height
             ctx.drawImage(img, 0, 0, settings.width, settings.height)
             
        } else if (tool === "bg-remover") {
             // Basic White BG Removal
             canvas.width = img.width
             canvas.height = img.height
             ctx.drawImage(img, 0, 0)
             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
             const data = imageData.data
             const threshold = settings.bgThreshold
             for (let i = 0; i < data.length; i += 4) {
                 const r = data[i], g = data[i + 1], b = data[i + 2]
                 if (r > threshold && g > threshold && b > threshold) {
                     data[i + 3] = 0 // Transparent
                 }
             }
             ctx.putImageData(imageData, 0, 0)
             
        } else if (tool === "id-card") {
             // Simple ID Card Layout
             canvas.width = 1000 // Credit Card Ratio ~ 86mm x 54mm -> 1.58
             canvas.height = 630
             
             // Background
             ctx.fillStyle = "#ffffff"
             ctx.fillRect(0, 0, canvas.width, canvas.height)
             ctx.fillStyle = "#f3f4f6" // Header band
             ctx.fillRect(0, 0, canvas.width, 150)
             
             // Photo (Left)
             const photoSize = 300
             ctx.save()
             ctx.beginPath()
             ctx.roundRect(50, 200, photoSize, photoSize, 20)
             ctx.clip()
             // Center crop photo into box
             const minDim = Math.min(img.width, img.height)
             ctx.drawImage(img, (img.width - minDim)/2, (img.height - minDim)/2, minDim, minDim, 50, 200, photoSize, photoSize)
             ctx.restore()
             
             // Text
             ctx.fillStyle = "#111827"
             ctx.font = "bold 60px sans-serif"
             ctx.fillText(settings.idName, 400, 300)
             ctx.fillStyle = "#6b7280"
             ctx.font = "40px sans-serif"
             ctx.fillText("ID: " + Math.floor(Math.random()*1000000), 400, 380)
             ctx.fillStyle = "#3b82f6"
             ctx.fillText("Employee", 400, 460)

        } else if (tool === "watermark") {
             canvas.width = img.width
             canvas.height = img.height
             ctx.drawImage(img, 0, 0)
             ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
             ctx.font = `bold ${img.width / 10}px sans-serif`
             ctx.textAlign = "center"
             ctx.textBaseline = "middle"
             ctx.translate(canvas.width / 2, canvas.height / 2)
             ctx.rotate(-Math.PI / 4)
             ctx.fillText(settings.watermarkText, 0, 0)
             
        } else if (tool === "crop") {
             // Center Crop (Square by default for now)
             const size = Math.min(img.width, img.height)
             canvas.width = size
             canvas.height = size
             ctx.drawImage(img, (img.width - size)/2, (img.height - size)/2, size, size, 0, 0, size, size)
             
        } else if (tool === "compress") {
             canvas.width = img.width
             canvas.height = img.height
             ctx.drawImage(img, 0, 0)
             // Quality applied in export
        } else {
             canvas.width = img.width
             canvas.height = img.height
             ctx.drawImage(img, 0, 0)
        }

        const quality = tool === "compress" ? settings.compressionQuality : 1.0
        const mimeType = tool === "compress" ? "image/jpeg" : "image/png"
        
        setProcessedImage(canvas.toDataURL(mimeType, quality))
        setIsProcessing(false)
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4">
                     <div className={`w-20 h-20 mx-auto rounded-3xl ${config.color.replace('text', 'bg')}/10 flex items-center justify-center border border-current`}>
                         <config.icon className={`w-10 h-10 ${config.color}`} />
                     </div>
                     <h1 className="text-4xl md:text-6xl font-black">{config.title}</h1>
                     <p className="text-xl text-muted-foreground">{config.desc}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                     {/* Input Section */}
                     <Card className="p-8 bg-card border-border shadow-lg space-y-8">
                          {!file ? (
                              <FileUploader onFileSelect={handleFileSelect} accept="image/*" />
                          ) : (
                              <div className="space-y-6">
                                  <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/50 aspect-square flex items-center justify-center">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-full object-contain" />
                                  </div>
                                  
                                  {/* Tool Controls */}
                                  <div className="space-y-4 p-6 bg-card rounded-2xl border-2 border-primary/20 shadow-lg animate-in slide-in-from-top-4">
                                       <h3 className="font-bold flex items-center gap-2 text-lg text-primary"><Palette size={20} /> Settings Panel</h3>
                                       
                                       {tool === "resize" && (
                                           <div className="space-y-4">
                                               <p className="text-xs font-medium text-muted-foreground">Original Size: {settings.width} x {settings.height} px</p>
                                               <div className="grid grid-cols-2 gap-4">
                                                   <div>
                                                       <label className="text-xs font-bold uppercase text-foreground mb-1 block">New Width</label>
                                                       <input type="number" value={settings.width} onChange={(e) => setSettings(s => ({...s, width: Number(e.target.value)}))} className="w-full p-3 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all" />
                                                   </div>
                                                   <div>
                                                        <label className="text-xs font-bold uppercase text-foreground mb-1 block">New Height</label>
                                                       <input type="number" value={settings.height} onChange={(e) => setSettings(s => ({...s, height: Number(e.target.value)}))} className="w-full p-3 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all" />
                                                   </div>
                                               </div>
                                           </div>
                                       )}
                                       {tool === "blur" && (
                                           <div>
                                               <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Blur Strength: {settings.blur}px</label>
                                               <Slider value={[settings.blur]} min={0} max={50} step={1} onValueChange={(v) => setSettings(s => ({...s, blur: v[0]}))} />
                                           </div>
                                       )}
                                       {tool === "watermark" && (
                                            <div>
                                                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Watermark Text</label>
                                                <input type="text" value={settings.watermarkText} onChange={(e) => setSettings(s => ({...s, watermarkText: e.target.value}))} className="w-full p-3 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all" />
                                            </div>
                                       )}
                                        {tool === "id-card" && (
                                            <div>
                                                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Name on Card</label>
                                                <input type="text" value={settings.idName} onChange={(e) => setSettings(s => ({...s, idName: e.target.value}))} className="w-full p-3 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all" />
                                            </div>
                                       )}
                                       {tool === "compress" && (
                                           <div>
                                               <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block flex justify-between">
                                                   <span>Quality</span>
                                                   <span>{Math.round(settings.compressionQuality * 100)}%</span>
                                               </label>
                                               <Slider value={[settings.compressionQuality * 100]} min={1} max={100} step={1} onValueChange={(v) => setSettings(s => ({...s, compressionQuality: v[0]/100}))} />
                                           </div>
                                       )}
                                        {tool === "bg-remover" && (
                                           <div>
                                               <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block flex justify-between">
                                                   <span>White Threshold</span>
                                                   <span>{settings.bgThreshold}</span>
                                               </label>
                                               <Slider value={[settings.bgThreshold]} min={0} max={255} step={1} onValueChange={(v) => setSettings(s => ({...s, bgThreshold: v[0]}))} />
                                               <p className="text-xs text-muted-foreground mt-2">Removes solid white/light backgrounds.</p>
                                           </div>
                                       )}
                                       {tool === "passport" && (
                                           <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 font-medium"><CheckCircle size={16} /> Auto-cropping to 35mm x 45mm</p>
                                           </div>
                                       )}
                                  </div>

                                  <div className="flex gap-4">
                                      <Button onClick={() => setFile(null)} variant="outline" className="flex-1 py-6 h-auto text-lg hover:bg-muted">Change File</Button>
                                      <Button onClick={processImage} disabled={isProcessing} className="flex-1 py-6 h-auto font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                          {isProcessing ? <RefreshCw className="mr-2 animate-spin" /> : <Zap className="mr-2" />}
                                          {isProcessing ? "Processing..." : "Process Now"}
                                      </Button>
                                  </div>
                              </div>
                          )}
                     </Card>

                     {/* Result Section */}
                     <Card className="p-8 bg-card border-border shadow-lg flex flex-col items-center justify-center min-h-[400px]">
                          {processedImage ? (
                               <div className="space-y-6 w-full text-center animate-in zoom-in-95">
                                    <div className="p-2 border-2 border-dashed border-primary/30 rounded-2xl bg-muted/30 inline-block relative">
                                        {/* Result Preview */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={processedImage} alt="Result" className="max-w-full max-h-[400px] rounded-xl shadow-2xl" />
                                        
                                        {tool === "bg-remover" && (
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-foreground">Done! ✨</h3>
                                        <a href={processedImage} download={`processed-${tool}.png`} className="block">
                                            <Button className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20">
                                                <Download className="mr-2" /> Download Image
                                            </Button>
                                        </a>
                                        <Button onClick={() => setProcessedImage(null)} variant="ghost" className="w-full">Edit Again</Button>
                                    </div>
                               </div>
                          ) : (
                              <div className="text-center space-y-4 opacity-50">
                                   <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                                       <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                   </div>
                                   <p className="text-lg font-medium">Processed image will appear here</p>
                              </div>
                          )}
                     </Card>
                </div>

            </div>
        </div>
    )
}
