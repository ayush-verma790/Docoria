"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Maximize, CheckCircle, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null)
  const [resizeType, setResizeType] = useState<"a4" | "letter" | "custom">("a4")
  const [customWidth, setCustomWidth] = useState(210)
  const [customHeight, setCustomHeight] = useState(297)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null)
  const [error, setError] = useState("")

  const handleResize = async () => {
    if (!file) return

    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", resizeType)
      if (resizeType === "custom") {
        formData.append("width", customWidth.toString())
        formData.append("height", customHeight.toString())
      }

      const res = await fetch("/api/resize", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
        <SiteHeader />

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

      <div className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                 <Maximize className="w-8 h-8 text-purple-500" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                 Resize Documents
             </h1>
             <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                 Change page dimensions to standard sizes (A4, Letter) or custom measurements.
             </p>
        </div>

        <Card className="p-8 border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative">
          {!result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">1</span> Upload File
                 </h2>
                 <FileUploader onFileSelect={(files) => setFile(files[0] || null)} />
              </div>

              <div className={cn("space-y-6 transition-all duration-500", !file ? "opacity-50 blur-[2px] pointer-events-none" : "opacity-100")}>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">2</span> Choose New Size
                </h2>
                
                <RadioGroup value={resizeType} onValueChange={(v) => setResizeType(v as "a4" | "letter" | "custom")} className="grid md:grid-cols-3 gap-4">
                  {[
                      { id: "a4", label: "A4 Format", dim: "210 x 297 mm", sub: "Standard International" },
                      { id: "letter", label: "US Letter", dim: "216 x 279 mm", sub: "Standard US" },
                      { id: "custom", label: "Custom Size", dim: "Set Dimensions", sub: "Manual Control" },
                  ].map((opt) => (
                      <div key={opt.id}>
                        <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                        <Label
                            htmlFor={opt.id}
                            className="flex flex-col p-4 rounded-xl border border-white/5 bg-slate-950/50 hover:bg-slate-800 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-600/10 peer-data-[state=checked]:text-purple-400 cursor-pointer transition-all h-full group relative overflow-hidden"
                        >
                            <span className="font-bold text-lg mb-1">{opt.label}</span>
                            <span className="text-sm text-slate-400 mb-2 group-hover:text-slate-300">{opt.dim}</span>
                            <span className="text-xs text-slate-600">{opt.sub}</span>
                        </Label>
                      </div>
                  ))}
                </RadioGroup>

                {resizeType === "custom" && (
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-950/30 rounded-xl border border-white/5 animate-in zoom-in-95">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-xs uppercase font-bold">Width (mm)</Label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="bg-slate-900 border-white/10 text-lg h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-xs uppercase font-bold">Height (mm)</Label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="bg-slate-900 border-white/10 text-lg h-12"
                      />
                    </div>
                  </div>
                )}

                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">{error}</div>}

                <Button
                    onClick={handleResize}
                    disabled={!file || isLoading}
                    className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-bold text-lg rounded-xl shadow-lg shadow-purple-500/20"
                >
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" size={24} />
                        Resizing...
                    </>
                    ) : (
                    <>Resize Document <ArrowRight className="ml-2 w-5 h-5" /></>
                    )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
               <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  <CheckCircle className="w-12 h-12 text-purple-500" />
               </div>
               <div>
                  <h2 className="text-3xl font-bold mb-2">Resize Complete!</h2>
                  <p className="text-slate-400">Your document has been successfully resized.</p>
               </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Button variant="ghost" onClick={() => setResult(null)} className="flex-1 h-14 text-slate-400 hover:text-white hover:bg-white/5">
                  Resize Another
                </Button>
                <a href={result.downloadUrl} className="flex-1">
                  <Button className="w-full h-14 bg-purple-600 hover:bg-purple-700 shadow-xl font-bold text-lg">
                    <Download className="mr-2" size={20} />
                    Download PDF
                  </Button>
                </a>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
