"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, ArrowLeft, RotateCw, Trash2, GripVertical, Sparkles, FileText, Upload, Check } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { cn } from "@/lib/utils"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function OrganizePage() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null)
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
      {/* Modern Header - Responsive */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <button 
                onClick={() => window.history.back()}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-x l md:text-2xl font-bold text-gray-900 truncate">Organize Pages</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">Reorder, rotate, and manage your PDF pages</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {file && !result && (
                <Button
                  onClick={handleProcess}
                  disabled={!file || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-9 sm:h-10 px-3 sm:px-5 text-sm sm:text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              )}

              {result && (
                <>
                  <a href={result.downloadUrl} download className="cursor-pointer">
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer h-9 sm:h-10 px-3 sm:px-5">
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">Download</span>
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    onClick={() => { setResult(null); setFile(null); setPageOrder([]) }}
                    className="border-gray-300 hover:bg-gray-50 cursor-pointer h-9 sm:h-10 px-3 sm:px-5"
                  >
                    <span className="hidden sm:inline">New Document</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Padding */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!file ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-full max-w-xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Your PDF</h2>
                <p className="text-sm sm:text-base text-gray-600 px-4">Drag and drop your PDF file here or click to browse</p>
              </div>
              <Card className="p-6 sm:p-10 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/10 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md rounded-xl">
                <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info - Responsive */}
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
                      {Object.keys(rotations).length > 0 && (
                        <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                          {Object.keys(rotations).length} rotated
                        </span>
                      )}
                      {pageOrder.some((p, i) => p !== i + 1) && (
                        <span className="text-xs sm:text-sm text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                          Reordered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setFile(null); setResult(null); setPageOrder([]) }}
                  className="cursor-pointer shrink-0 ml-auto sm:ml-0"
                >
                  Change File
                </Button>
              </div>
            </Card>

            {/* Page Grid - Responsive Columns and Gaps */}
            <Document 
              file={file} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('PDF load error:', error)
                setError('Failed to load PDF: ' + error.message)
              }}
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
                      "group relative cursor-grab active:cursor-grabbing transition-all",
                      draggedIndex === index && "opacity-50"
                    )}
                  >
                    <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all">
                      {/* Page Number */}
                      <div className="absolute top-2 left-2 z-10 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                        {index + 1}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => rotatePage(originalPageNum)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                          title="Rotate 90°"
                        >
                          <RotateCw size={14} className="text-gray-700" />
                        </button>
                        <button
                          onClick={() => deletePage(index)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete page"
                          disabled={pageOrder.length <= 1}
                        >
                          <Trash2 size={14} className="text-gray-700 hover:text-red-600" />
                        </button>
                      </div>

                      {/* PDF Preview */}
                      <div 
                        className="aspect-[3/4] bg-gray-50 flex items-center justify-center"
                        style={{
                          transform: `rotate(${rotations[originalPageNum] || 0}deg)`,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <Page
                          pageNumber={originalPageNum}
                          width={180}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>

                      {/* Rotation Badge */}
                      {rotations[originalPageNum] && (
                        <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                          {rotations[originalPageNum]}°
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Document>

            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
