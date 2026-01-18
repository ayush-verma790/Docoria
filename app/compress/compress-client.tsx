"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, CheckCircle, FileText, ArrowRight, Settings2, Gauge, Target, Star, Zap, BarChart3, TrendingDown, RefreshCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function CompressClient() {
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

  // Fake estimation logic for UI Visualization
  const [estimatedReduction, setEstimatedReduction] = useState(0)

  useEffect(() => {
      if (mode === 'preset') {
          if (presetQuality === 'low') setEstimatedReduction(70) // Max compression
          if (presetQuality === 'medium') setEstimatedReduction(40)
          if (presetQuality === 'high') setEstimatedReduction(15)
      } else if (mode === 'custom') {
          setEstimatedReduction(100 - customQuality[0])
      } else {
          setEstimatedReduction(50) // Average guess for target
      }
  }, [mode, presetQuality, customQuality])

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
    <div className="dark min-h-screen bg-[#030014] text-white font-sans selection:bg-indigo-500/30 selection:text-white">
      <SiteHeader />
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[30%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }}
             className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-float"
           >
               <Zap className="w-10 h-10 text-indigo-400" fill="currentColor" fillOpacity={0.2} />
           </motion.div>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
             Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Compress</span>
           </h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
             Reduce file size intelligently. Maximize storage, minimize waiting.
           </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Input and Controls */}
            <div className="lg:col-span-2 space-y-6">
                <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/0 shadow-2xl">
                    <div className="p-8 rounded-[2.3rem] bg-[#0A0A0F] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50"></div>
                        
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

                                <div className={cn("transition-all duration-500 space-y-8", !file ? "opacity-30 pointer-events-none grayscale" : "opacity-100")}>
                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 ring-1 ring-indigo-500/40">2</span>
                                            Compression Level
                                        </h3>
                                        
                                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-white/5 border border-white/5 rounded-2xl h-auto backdrop-blur-sm">
                                                <TabsTrigger value="preset" className="h-10 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all">Preset</TabsTrigger>
                                                <TabsTrigger value="target" className="h-10 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all">Target Size</TabsTrigger>
                                                <TabsTrigger value="custom" className="h-10 rounded-xl text-muted-foreground data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all">Custom</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="preset" className="space-y-6">
                                                <RadioGroup value={presetQuality} onValueChange={(v) => setPresetQuality(v as any)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {[
                                                        { id: "low", label: "Extreme", desc: "Max Compression", icon: Zap, color: "text-amber-400" },
                                                        { id: "medium", label: "Balanced", desc: "Recommended", icon: Target, color: "text-indigo-400" },
                                                        { id: "high", label: "Light", desc: "High Quality", icon: Star, color: "text-emerald-400" },
                                                    ].map((option) => (
                                                        <div key={option.id}>
                                                            <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={option.id}
                                                                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-500/10 peer-data-[state=checked]:text-indigo-400 cursor-pointer transition-all h-full group"
                                                            >
                                                                <option.icon className={`mb-3 w-6 h-6 ${option.color} group-hover:scale-110 transition-transform`} />
                                                                <span className="font-bold text-sm mb-1 text-white">{option.label}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{option.desc}</span>
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </TabsContent>

                                            <TabsContent value="target" className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="target-size" className="text-white text-base">Target File Size</Label>
                                                    <div className="relative group">
                                                        <Input 
                                                            id="target-size"
                                                            type="number"
                                                            value={targetSize}
                                                            onChange={(e) => setTargetSize(e.target.value)}
                                                            className="pr-16 text-2xl font-bold h-16 bg-white/5 border-white/10 rounded-xl focus:border-indigo-500 transition-colors text-white"
                                                            min="1"
                                                        />
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold group-focus-within:text-white transition-colors">KB</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">We'll try to get your file under this size.</p>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="custom" className="space-y-8">
                                                <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <Label className="text-white text-base">Quality</Label>
                                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{customQuality[0]}%</span>
                                                    </div>
                                                    <Slider
                                                        value={customQuality}
                                                        onValueChange={setCustomQuality}
                                                        max={100}
                                                        step={1}
                                                        className="py-4 cursor-pointer"
                                                    />
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    {/* Visual Estimation */}
                                    {file && (
                                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                                            <div className="flex justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                                <span>Original: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span className="text-indigo-400">Est. Savings: ~{estimatedReduction}%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                                                {/* Original Bar */}
                                                <div className="absolute inset-y-0 left-0 w-full bg-white/20"></div>
                                                {/* Compressed Bar */}
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                                                    style={{ width: `${100 - estimatedReduction}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

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
                                            "w-full h-16 text-xl font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-indigo-600 to-purple-600 border border-white/20 text-white",
                                            isLoading && "opacity-80 grayscale"
                                        )}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-3 animate-spin" size={24} />
                                                Running Compressor...
                                            </>
                                        ) : (
                                            "Compress PDF"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in zoom-in-95 duration-500 py-8">
                                <div className="text-center space-y-6">
                                    <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative">
                                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                                        <CheckCircle className="w-16 h-16 text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-white mb-2">Compressed!</h2>
                                        <p className="text-emerald-400 font-medium text-lg flex items-center justify-center gap-2">
                                            <TrendingDown className="w-5 h-5" />
                                            Reduced by {reduction}%
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-white/5 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Original Size</p>
                                        <p className="text-2xl font-bold text-white/60 line-through decoration-red-500/50">{(result.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <div className="flex justify-center">
                                       <ArrowRight className="text-white/20 hidden md:block w-8 h-8" />
                                       <ArrowRight className="text-white/20 md:hidden rotate-90 w-8 h-8" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">New Size</p>
                                        <p className="text-4xl font-black text-white text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-200">{(result.compressedSize / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 flex-col sm:flex-row pt-4">
                                     <Button variant="outline" onClick={() => setResult(null)} className="flex-1 h-14 rounded-xl border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white font-medium">
                                        <RefreshCcw className="mr-2 h-4 w-4" /> Compress Another
                                    </Button>
                                    <a href={result.downloadUrl} download className="flex-[2]">
                                        <Button className="w-full h-14 rounded-xl bg-white text-black hover:bg-zinc-200 shadow-xl font-bold text-lg transition-all hover:translate-y-[-2px]">
                                            <Download className="mr-2" size={20} strokeWidth={3} />
                                            Download Now
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Info / Tips */}
            <div className="space-y-6">
                 <div className="p-8 glass-panel rounded-[2rem] border-white/5 bg-white/[0.02]">
                    <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" /> Performance
                    </h3>
                    <ul className="space-y-6">
                        <li className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <Zap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm mb-1">Fast Processing</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Compressed in seconds using advanced algorithms.</p>
                            </div>
                        </li>
                        <li className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm mb-1">Precision</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Target specific file sizes for portal uploads.</p>
                            </div>
                        </li>
                    </ul>
                 </div>
                 
                 <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings2 className="w-32 h-32 -rotate-12 translate-x-10 -translate-y-10" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold mb-4 border border-white/20 backdrop-blur-md">
                            PREMIUM FEATURE
                        </div>
                        <h4 className="font-bold text-lg mb-2">Smart Optimization</h4>
                        <p className="text-white/80 text-sm leading-relaxed font-medium">
                            Our "Balanced" mode uses AI to determine the best compression ratio for your specific document type, preserving text clarity while smashing images.
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  )
}

