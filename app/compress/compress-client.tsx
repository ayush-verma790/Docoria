"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, CheckCircle, FileText, ArrowRight, Settings2, Gauge, Target, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<"preset" | "target" | "custom">("preset")
  const [presetQuality, setPresetQuality] = useState<"low" | "medium" | "high">("medium")
  const [targetSize, setTargetSize] = useState<string>("500")
  const [customQuality, setCustomQuality] = useState<number[]>([80])
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; downloadUrl: string } | null>(
    null,
  )
  const [error, setError] = useState("")

  const handleCompress = async () => {
    if (!file) {
        setError("Please select a file first")
        return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)

      if (mode === "preset") {
        formData.append("quality", presetQuality)
      } else if (mode === "target") {
        formData.append("targetSizeKB", targetSize)
      } else if (mode === "custom") {
        formData.append("qualityValue", customQuality[0].toString())
      }

      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Compression failed")
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed")
    } finally {
      setIsLoading(false)
    }
  }

  const reduction = result
    ? (((result.originalSize - result.compressedSize) / result.originalSize) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[30%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-float">
               <Zap className="w-10 h-10 text-indigo-400" fill="currentColor" fillOpacity={0.2} />
           </div>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
             Smart Compress
           </h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
             Reduce file size without losing quality. Ideal for email uploads and web optimization.
           </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Input and Controls */}
            <div className="lg:col-span-2 space-y-6">
                <div className="p-10 rounded-[2.5rem] bg-[#0A0A0F]/50 border border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Gauge className="w-48 h-48 text-indigo-500 rotate-12" />
                    </div>
                    
                    {!result ? (
                        <div className="space-y-10 relative z-10">
                            <div>
                                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 ring-1 ring-indigo-500/40">1</span>
                                    Select File
                                </h3>
                                <FileUploader 
                                    onFileSelect={(files) => setFile(files[0] || null)} 
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                />
                            </div>

                            <div className={cn("transition-all duration-500", !file ? "opacity-50 blur-[2px] pointer-events-none" : "opacity-100")}>
                                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 ring-1 ring-indigo-500/40">2</span>
                                    Compression Method
                                </h3>
                                
                                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-8 p-1.5 bg-black/40 border border-white/5 rounded-2xl h-auto">
                                        <TabsTrigger value="preset" className="h-12 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all">Preset</TabsTrigger>
                                        <TabsTrigger value="target" className="h-12 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all">Target Size</TabsTrigger>
                                        <TabsTrigger value="custom" className="h-12 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all">Custom</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="preset" className="space-y-6">
                                        <RadioGroup value={presetQuality} onValueChange={(v) => setPresetQuality(v as any)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: "low", label: "Maximum", desc: "Smallest size", icon: Gauge },
                                                { id: "medium", label: "Balanced", desc: "Recommended", icon: Target },
                                                { id: "high", label: "High Quality", desc: "Best details", icon: Star },
                                            ].map((option) => (
                                                <div key={option.id}>
                                                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={option.id}
                                                        className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-500/10 peer-data-[state=checked]:text-indigo-400 cursor-pointer transition-all h-full group backdrop-blur-md"
                                                    >
                                                        <option.icon className="mb-4 w-8 h-8 text-muted-foreground group-hover:text-white peer-data-[state=checked]:scale-110 transition-transform peer-data-[state=checked]:text-indigo-400" />
                                                        <span className="font-bold text-base mb-1 text-white">{option.label}</span>
                                                        <span className="text-xs text-muted-foreground peer-data-[state=checked]:text-indigo-300">{option.desc}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </TabsContent>

                                    <TabsContent value="target" className="space-y-6">
                                        <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 text-amber-200 text-sm flex items-start gap-3">
                                            <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400/20" />
                                            We'll attempt to compress the file to be under this size. This is perfect for portals with strict upload limits.
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="target-size" className="text-white text-base">Target Size (KB)</Label>
                                            <div className="relative group">
                                                <Input 
                                                    id="target-size"
                                                    type="number"
                                                    value={targetSize}
                                                    onChange={(e) => setTargetSize(e.target.value)}
                                                    className="pr-16 text-xl h-14 bg-black/20 border-white/10 rounded-xl focus:border-indigo-500 transition-colors text-white placeholder:text-muted-foreground/50"
                                                    min="1"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium group-focus-within:text-white transition-colors">KB</span>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="custom" className="space-y-8">
                                        <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-white text-base">Compression Quality</Label>
                                                <span className="text-indigo-300 font-bold bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-lg">{customQuality[0]}%</span>
                                            </div>
                                            <Slider
                                                value={customQuality}
                                                onValueChange={setCustomQuality}
                                                max={100}
                                                step={1}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <span className="text-emerald-400">Smaller Size</span>
                                                <span className="text-indigo-400">Better Quality</span>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-200 rounded-xl border border-red-500/20 animate-in fade-in flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleCompress}
                                disabled={!file || isLoading}
                                className={cn(
                                    "w-full h-16 text-xl font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] bg-white text-black hover:bg-indigo-50",
                                    isLoading && "opacity-80"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-3 animate-spin" size={24} />
                                        Optimizing...
                                    </>
                                ) : (
                                    "Compress File Now"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-float">
                                    <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={3} />
                                </div>
                                <h2 className="text-4xl font-black text-white">Compression Successful!</h2>
                                <p className="text-muted-foreground text-lg">Your file is ready for download.</p>
                            </div>

                            <div className="bg-black/30 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-white/5 backdrop-blur-md">
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Original</p>
                                    <p className="text-3xl font-bold text-white">{(result.originalSize / 1024 / 1024).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MB</span></p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <ArrowRight className="text-white/20 hidden md:block w-8 h-8" />
                                    <ArrowRight className="text-white/20 md:hidden rotate-90 w-8 h-8" />
                                    <span className="text-sm font-bold text-white bg-emerald-500 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                        -{reduction}%
                                    </span>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Compressed</p>
                                    <p className="text-3xl font-bold text-emerald-400">{(result.compressedSize / 1024 / 1024).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MB</span></p>
                                </div>
                            </div>

                            <div className="flex gap-4 flex-col sm:flex-row pt-4">
                                 <Button variant="ghost" onClick={() => setResult(null)} className="flex-1 h-14 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 font-medium">
                                    Compress Another
                                </Button>
                                <a href={result.downloadUrl} download className="flex-[2]">
                                    <Button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[#6366f1]/40 shadow-lg font-bold text-xl transition-all hover:scale-105">
                                        <Download className="mr-2" size={24} strokeWidth={3} />
                                        Download File
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Info / Tips */}
            <div className="space-y-6">
                 <div className="p-8 glass-panel rounded-3xl border-white/5">
                    <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" /> Why Compress?
                    </h3>
                    <ul className="space-y-6">
                        <li className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                <Zap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm mb-1">Faster Transfers</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Faster upload and download speeds for you and your recipients.</p>
                            </div>
                        </li>
                        <li className="flex gap-4 group">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                <Target className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm mb-1">Save Storage</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Keep your device storage clean and optimized.</p>
                            </div>
                        </li>
                        <li className="flex gap-4 group">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                <Gauge className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm mb-1">Meet Limits</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Perfect for email attachments and portal uploads.</p>
                            </div>
                        </li>
                    </ul>
                 </div>
                 
                 <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings2 className="w-32 h-32 -rotate-12 translate-x-10 -translate-y-10" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-4 border border-white/20">
                            PRO TIP
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                            Use "Target Size" mode when you need to meet a specific file requirement (e.g., 500KB) for government or job portals. We'll do the math for you.
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  )
}

