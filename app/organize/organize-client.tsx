"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, ArrowLeft, RotateCw, Trash2, GripVertical, Sparkles, FileText, Upload, Check } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { cn } from "@/lib/utils"

export default function OrganizeClient() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null)
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageOrder(Array.from({ length: numPages }, (_, i) => i + 1))
  }

  const movePage = (fromIndex: number, toIndex: number) => {
    const newOrder = [...pageOrder]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setPageOrder(newOrder)
  }

  const rotatePage = (originalPageNum: number) => {
    setRotations(prev => ({
      ...prev,
      [originalPageNum]: ((prev[originalPageNum] || 0) + 90) % 360
    }))
  }

  const deletePage = (indexToRemove: number) => {
    if (pageOrder.length <= 1) {
      alert("Cannot delete the last page")
      return
    }
    const newOrder = pageOrder.filter((_, i) => i !== indexToRemove)
    setPageOrder(newOrder)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    movePage(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("pageOrder", JSON.stringify(pageOrder))
      formData.append("rotations", JSON.stringify(rotations))
      formData.append("signature", "placeholder")
      formData.append("positions", JSON.stringify([]))
      formData.append("textEdits", JSON.stringify([]))
      const res = await fetch("/api/sign", {
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
      setError(err instanceof Error ? err.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <button 
                onClick={() => window.history.back()}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Organize Pages</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">Reorder, rotate, and manage your PDF pages</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {file && !result && (
                <Button
                  onClick={handleProcess}
                  disabled={!file || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer h-9 sm:h-10 px-3 sm:px-5"
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /><span>Saving...</span></>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /><span>Save Changes</span></>
                  )}
                </Button>
              )}
              {result && (
                <>
                  <a href={result.downloadUrl} download>
                    <Button className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 px-3 sm:px-5">
                      <Download className="mr-2 h-4 w-4" /><span>Download PDF</span>
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    onClick={() => { setResult(null); setFile(null); setPageOrder([]) }}
                    className="h-9 sm:h-10 px-3 sm:px-5"
                  >
                    <span>New Document</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!file ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-full max-w-xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Your PDF</h2>
                <p className="text-sm sm:text-base text-gray-600">Select a PDF file to manage its pages</p>
              </div>
              <Card className="p-6 sm:p-10 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-shadow rounded-xl">
                <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-4 sm:p-5 bg-white border shadow-sm rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{file.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {pageOrder.length} pages
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setFile(null); setResult(null); setPageOrder([]) }}>Change File</Button>
              </div>
            </Card>
            <Document 
              file={file} 
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {pageOrder.map((originalPageNum, index) => (
                  <div
                    key={`page-${index}-${originalPageNum}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group relative bg-white rounded-lg border-2 transition-all duration-200 overflow-hidden",
                      draggedIndex === index ? "opacity-30 scale-95 border-blue-500 ring-2 ring-blue-100" : "hover:shadow-md hover:border-blue-300 border-gray-200",
                      "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="aspect-[3/4] flex items-center justify-center p-2 bg-gray-50 overflow-hidden">
                      <Page
                        pageNumber={originalPageNum}
                        width={180}
                        rotate={rotations[originalPageNum] || 0}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<div className="w-full aspect-[3/4] bg-gray-100 animate-pulse" />}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/40 transition-colors pointer-events-none" />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); rotatePage(originalPageNum); }}
                        className="p-1.5 sm:p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Rotate 90°"
                      >
                        <RotateCw size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePage(index); }}
                        className="p-1.5 sm:p-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                        <GripVertical size={14} className="text-gray-400" />
                      </div>
                    </div>
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
