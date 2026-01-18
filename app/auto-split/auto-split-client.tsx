"use client"

import { useState } from "react"
import { pdfjs } from "react-pdf"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Scissors, FileText, Ruler, HardDrive, Zap, CheckCircle, Split } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import JSZip from "jszip"
import "react-pdf/dist/Page/TextLayer.css"

// Initialize worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export default function AutoSplitClient() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState("interval") // interval | size | text
  const [interval, setInterval] = useState(1)
//   const [maxSizeMB, setMaxSizeMB] = useState(5) // Not fully implemented in this MVP due to complexity of precise size prediction
  const [splitText, setSplitText] = useState("Chapter")
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<{ downloadUrl: string, filename: string } | null>(null)

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setLogs(["Starting process..."])
    setResult(null)

    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const numPages = pdfDoc.getPageCount()
        
        let splitPoints: number[] = [0] // Start index of each chunk
        
        if (mode === "interval") {
             setLogs(p => [...p, `Splitting every ${interval} pages...`])
             for (let i = interval; i < numPages; i += interval) {
                 splitPoints.push(i)
             }
        } else if (mode === "text") {
            setLogs(p => [...p, `Scanning for content: "${splitText}"...`])
            // Using PDF.js to read text
            const pdfJsDoc = await pdfjs.getDocument(arrayBuffer).promise
            
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfJsDoc.getPage(i)
                const textContent = await page.getTextContent()
                // @ts-ignore
                const str = textContent.items.map(item => item.str).join(" ")
                
                if (str.includes(splitText)) {
                    // Split AT this page (starts a new doc here)
                    // (Index is i-1)
                    // Avoid splitting at 0
                    if (i - 1 > 0) {
                        splitPoints.push(i - 1)
                        setLogs(p => [...p, `Found trigger at page ${i}`])
                    }
                }
            }
        }
        
        // Add end point
        splitPoints.push(numPages)
        // Deduplicate and sort
        splitPoints = Array.from(new Set(splitPoints)).sort((a,b) => a-b)
        
        const zip = new JSZip()
        const folder = zip.folder("split_parts")
        
        setLogs(p => [...p, `Creating ${splitPoints.length - 1} documents...`])

        let partCount = 0
        for (let i = 0; i < splitPoints.length - 1; i++) {
            const start = splitPoints[i]
            const end = splitPoints[i+1] // Exclusive
            
            // Create new doc
            const newDoc = await PDFDocument.create()
            // copyPages takes array of 0-based indices
            const indices = []
            for (let j = start; j < end; j++) indices.push(j)
            
            const copiedPages = await newDoc.copyPages(pdfDoc, indices)
            copiedPages.forEach(page => newDoc.addPage(page))
            
            const pdfBytes = await newDoc.save()
            folder?.file(`part_${i + 1}_pages_${start + 1}-${end}.pdf`, pdfBytes)
            partCount++
        }
        
        const content = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(content)
        
        setLogs(p => [...p, `Done! Created ${partCount} files.`])
        setResult({
            downloadUrl: url,
            filename: `split_files_${Date.now()}.zip` // Corrected template literal
        })

    } catch (e) {
        console.error(e)
        alert("Error during split. See console.")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
        <SiteHeader />
        
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] mix-blend-screen animate-blob"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
             <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                      <Split className="w-10 h-10 text-orange-500" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                      Auto <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">PDF Splitter</span>
                  </h1>
                  <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                      Intelligent document separation. Split by pages or content.
                  </p>
             </div>

             <div className="grid md:grid-cols-1 gap-8">
                  <Card className="bg-[#0A0A0F] border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                      {!file ? (
                          <div className="py-12">
                             <FileUploader onFileSelect={(f) => setFile(f[0])} accept=".pdf" />
                          </div>
                      ) : (
                          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <FileText />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{file.name}</h3>
                                            <p className="text-xs text-slate-500">{(file.size/1024/1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => { setFile(null); setResult(null); }} className="text-red-400 hover:bg-red-500/10">Change</Button>
                               </div>

                               {!result ? (
                                   <div className="space-y-8">
                                       
                                       <Tabs defaultValue="interval" onValueChange={setMode} className="w-full">
                                            <TabsList className="w-full bg-black/40 p-1 rounded-xl h-14">
                                                <TabsTrigger value="interval" className="flex-1 rounded-lg h-12 data-[state=active]:bg-orange-600 text-slate-400 data-[state=active]:text-white font-bold transition-all"><Ruler className="mr-2 w-4 h-4" /> By Interval</TabsTrigger>
                                                <TabsTrigger value="text" className="flex-1 rounded-lg h-12 data-[state=active]:bg-orange-600 text-slate-400 data-[state=active]:text-white font-bold transition-all"><FileText className="mr-2 w-4 h-4" /> By Content</TabsTrigger>
                                                {/* <TabsTrigger value="size" disabled className="flex-1 rounded-lg h-12 opacity-50"><HardDrive className="mr-2 w-4 h-4" /> By Size (Coming Soon)</TabsTrigger> */}
                                            </TabsList>
                                            
                                            <div className="mt-8 bg-white/5 border border-white/5 rounded-2xl p-8 min-h-[150px] flex flex-col justify-center">
                                                <TabsContent value="interval" className="mt-0 space-y-4">
                                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Split every</label>
                                                    <div className="flex items-center gap-4">
                                                        <input 
                                                            type="number" 
                                                            min={1} 
                                                            value={interval} 
                                                            onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))}
                                                            className="text-4xl font-black bg-transparent border-b-2 border-orange-500 w-24 text-center focus:outline-none focus:border-white transition-colors"
                                                        />
                                                        <span className="text-2xl font-bold text-slate-500">Pages</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">Creates a new file every {interval} pages.</p>
                                                </TabsContent>

                                                <TabsContent value="text" className="mt-0 space-y-4">
                                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Split when page contains</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            value={splitText} 
                                                            onChange={(e) => setSplitText(e.target.value)}
                                                            className="w-full text-2xl font-bold bg-transparent border-b-2 border-orange-500 p-2 focus:outline-none focus:border-white transition-colors placeholder:text-slate-700"
                                                            placeholder="e.g. Invoice #"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">Starts a new document whenever the text is found on a page.</p>
                                                </TabsContent>
                                            </div>
                                       </Tabs>

                                       <Button 
                                            onClick={handleProcess} 
                                            disabled={isProcessing}
                                            className="w-full h-16 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] transition-transform hover:scale-[1.01]"
                                        >
                                           {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Scissors className="mr-2" />}
                                           {isProcessing ? "Analyzing & Splitting..." : "Split PDF Now"}
                                       </Button>

                                       {logs.length > 0 && (
                                            <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-slate-400 max-h-32 overflow-y-auto custom-scrollbar border border-white/5">
                                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                                            </div>
                                       )}
                                   </div>
                               ) : (
                                   <div className="text-center space-y-8 py-8 animate-in zoom-in-95">
                                       <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                           <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={3} />
                                       </div>
                                       <div>
                                           <h3 className="text-4xl font-black text-white">Split Successful!</h3>
                                           <p className="text-gl text-slate-400 mt-2">Downloaded automatically.</p>
                                       </div>
                                       
                                       <a href={result.downloadUrl} download={result.filename} className="block">
                                            <Button className="w-full h-16 bg-white text-black hover:bg-slate-200 font-bold text-xl rounded-2xl shadow-xl">
                                                <Download className="mr-2" /> Download ZIP
                                            </Button>
                                       </a>
                                       <Button variant="ghost" onClick={() => { setResult(null); setLogs([]) }} className="text-slate-500">Split Another</Button>
                                   </div>
                               )}
                          </div>
                      )}
                  </Card>
             </div>
        </div>
    </div>
  )
}
