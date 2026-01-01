"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Loader2, Download, Image as ImageIcon, FileImage } from "lucide-react"

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])
  
  const handleDownload = async (pageNumber: number) => {
      if (!file) return
      try {
          const buffer = await file.arrayBuffer()
          const pdf = await pdfjs.getDocument(buffer).promise
          const page = await pdf.getPage(pageNumber)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          const context = canvas.getContext("2d")
          if (!context) return
          await page.render({ canvasContext: context, viewport } as any).promise
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9))
          if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${file.name.replace(".pdf", "")}-page-${pageNumber}.jpg`
              a.click()
              URL.revokeObjectURL(url)
          }
      } catch (e) {
          console.error(e)
          alert("Failed to convert page")
      }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-yellow-500/30">
        <div className="max-w-7xl mx-auto py-20 px-6">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
                     <ImageIcon className="w-8 h-8 text-yellow-500" />
                 </div>
                 <h1 className="text-4xl font-bold mb-2">PDF to JPG</h1>
                 <p className="text-slate-400">Convert pages to high-quality images instantly in your browser.</p>
            </div>
            {!file ? (
                <Card className="max-w-xl mx-auto p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl">
                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                </Card>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-slate-900 border border-white/10 p-4 rounded-xl">
                        <span className="font-medium text-slate-300">{file.name}</span>
                        <Button variant="outline" onClick={() => setFile(null)}>Change File</Button>
                    </div>
                    <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="flex justify-center">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from(new Array(numPages), (_, index) => (
                                <div key={index} className="space-y-3 group">
                                    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-800 shadow-xl group-hover:border-yellow-500 transition-colors">
                                        <Page 
                                            pageNumber={index + 1} 
                                            width={300} 
                                            renderTextLayer={false} 
                                            renderAnnotationLayer={false}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button onClick={() => handleDownload(index + 1)} className="bg-white text-slate-900 hover:bg-yellow-400">
                                                <Download className="mr-2 w-4 h-4" /> Save as JPG
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-slate-500">Page {index + 1}</div>
                                </div>
                            ))}
                        </div>
                    </Document>
                </div>
            )}
        </div>
    </div>
  )
}
