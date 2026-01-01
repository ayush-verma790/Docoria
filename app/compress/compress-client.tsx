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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <SiteHeader />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
               <Zap className="w-8 h-8 text-blue-500" />
           </div>
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
             Smart Compress
           </h1>
           <p className="text-lg text-slate-400 max-w-2xl mx-auto">
             Reduce file size without losing quality. Ideal for email uploads and web optimization.
           </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Input and Controls */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                    {!result ? (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">1</span>
                                    Select File
                                </h3>
                                <FileUploader 
                                    onFileSelect={(files) => setFile(files[0] || null)} 
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                />
                            </div>

                            <div className={cn("transition-all duration-500", !file ? "opacity-50 blur-[2px] pointer-events-none" : "opacity-100")}>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
                                    Compression Method
                                </h3>
                                
                                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-slate-950/50 border border-white/5 rounded-xl h-12">
                                        <TabsTrigger value="preset" className="h-10 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Preset</TabsTrigger>
                                        <TabsTrigger value="target" className="h-10 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Target Size</TabsTrigger>
                                        <TabsTrigger value="custom" className="h-10 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Custom</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="preset" className="space-y-4">
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
                                                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-slate-950/50 hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-600/10 peer-data-[state=checked]:text-blue-400 cursor-pointer transition-all h-full group"
                                                    >
                                                        <option.icon className="mb-3 w-6 h-6 text-slate-500 group-hover:text-blue-400 peer-data-[state=checked]:text-blue-500" />
                                                        <span className="font-semibold text-sm mb-1">{option.label}</span>
                                                        <span className="text-xs text-slate-500">{option.desc}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </TabsContent>

                                    <TabsContent value="target" className="space-y-4">
                                        <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 text-amber-200 text-sm">
                                            We'll attempt to compress the file to be under this size.
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="target-size" className="text-slate-300">Target Size (KB)</Label>
                                            <div className="relative">
                                                <Input 
                                                    id="target-size"
                                                    type="number"
                                                    value={targetSize}
                                                    onChange={(e) => setTargetSize(e.target.value)}
                                                    className="pr-12 text-lg bg-slate-950 border-white/10"
                                                    min="1"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">KB</span>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="custom" className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-slate-300">Quality Level</Label>
                                                <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{customQuality[0]}%</span>
                                            </div>
                                            <Slider
                                                value={customQuality}
                                                onValueChange={setCustomQuality}
                                                max={100}
                                                step={1}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Smaller Size</span>
                                                <span>Better Quality</span>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleCompress}
                                disabled={!file || isLoading}
                                className={cn(
                                    "w-full h-14 text-lg font-bold transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]",
                                    isLoading ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" size={24} />
                                        Compressing...
                                    </>
                                ) : (
                                    "Compress Now"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-bold">Compression Successful!</h2>
                                <p className="text-slate-400">Your file is ready for download.</p>
                            </div>

                            <div className="bg-slate-950/50 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-white/5">
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Original</p>
                                    <p className="text-2xl font-bold">{(result.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <ArrowRight className="text-slate-600 hidden md:block" />
                                    <ArrowRight className="text-slate-600 md:hidden rotate-90" />
                                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        -{reduction}%
                                    </span>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Compressed</p>
                                    <p className="text-2xl font-bold text-emerald-500">{(result.compressedSize / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div className="flex gap-4 flex-col sm:flex-row">
                                <Button variant="ghost" onClick={() => setResult(null)} className="flex-1 h-14 text-slate-400 hover:text-white hover:bg-white/5">
                                    Compress Another
                                </Button>
                                <a href={result.downloadUrl} download className="flex-1">
                                    <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 shadow-xl font-bold text-lg">
                                        <Download className="mr-2" size={20} />
                                        Download File
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Right Column: Info / Tips */}
            <div className="space-y-6">
                 <Card className="p-6 bg-slate-900/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" /> Why Compress?
                    </h3>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            Faster upload and download speeds
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            Save storage space on your device
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            Meet file size limits for email attachments
                        </li>
                    </ul>
                 </Card>
                 
                 <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                        Use "Target Size" mode when you need to meet a specific file size requirement (like 500KB) for application portals.
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  )
}


