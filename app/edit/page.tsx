"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css" 
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Upload, Maximize2, ZoomIn, ZoomOut, Check, ChevronLeft, ChevronRight, Type, PenTool, Image as ImageIcon, Move, Edit3, ArrowLeft, Grid, RotateCw, Trash2 } from "lucide-react"

import { SignaturePad } from "@/components/signature-pad"
import { FileUploader } from "@/components/file-uploader"
import { cn } from "@/lib/utils"

// Setting worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface Position {
    id: string
    page: number
    x: number
    y: number
    width: number
    height: number
    pageWidth?: number
    pageHeight?: number
}

interface TextEdit {
    id: string
    page: number
    x: number
    y: number
    width: number
    height: number
    text: string
    fontSize: string
    fontFamily: string
    color: string
    fontWeight: string
    fontStyle: string
    lineHeight: string
    letterSpacing: string
    pageWidth?: number
    pageHeight?: number
}

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [signature, setSignature] = useState<string>("")
  const [isSigning, setIsSigning] = useState(false)
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null)
  const [error, setError] = useState("")
  const [positions, setPositions] = useState<Position[]>([])
  const [textEdits, setTextEdits] = useState<TextEdit[]>([])
  const [scale, setScale] = useState(1.0)
  
  // Signature Creation State
  const [typedName, setTypedName] = useState("")
  const [activeTab, setActiveTab] = useState("draw")
  
  // Generated variants
  const [variants, setVariants] = useState<string[]>([])
  
  const pageRef = useRef<HTMLDivElement>(null)
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setCurrentPage(1)
  }
  
  const onPageLoadSuccess = (page: any) => {
      setPageDimensions({ width: page.originalWidth, height: page.originalHeight })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= numPages) {
        setCurrentPage(newPage)
    }
  }

  // Generate signature variants from Text
  const generateTextSignatures = () => {
       if (!typedName) return
       
       const fonts = [
           "italic 48px 'Times New Roman', serif",
           "48px 'Brush Script MT', cursive",
           "italic bold 48px 'Courier New', monospace"
       ]
       
       const newVariants: string[] = []
       
       fonts.forEach(font => {
           const canvas = document.createElement("canvas")
           const ctx = canvas.getContext("2d")
           if (!ctx) return
           
           canvas.width = 400
           canvas.height = 150
           
           ctx.clearRect(0, 0, canvas.width, canvas.height)
           
           ctx.font = font
           ctx.fillStyle = "black"
           ctx.textAlign = "center"
           ctx.textBaseline = "middle"
           ctx.fillText(typedName, canvas.width / 2, canvas.height / 2)
           
           newVariants.push(canvas.toDataURL("image/png"))
       })
       
       setVariants(newVariants)
       // Auto-select first if none selected
       if (!signature && newVariants.length > 0) {
           setSignature(newVariants[0])
       }
  }
  
  // Handle file upload for signature
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
              if (e.target?.result as string) {
                  setSignature(e.target!.result as string)
              }
          }
          reader.readAsDataURL(file)
      }
  }

// Editable Text Component
const EditableText = ({ 
    edit, 
    scale, 
    onUpdate, 
    onRemove 
}: { 
    edit: TextEdit, 
    scale: number, 
    onUpdate: (id: string, text: string) => void,
    onRemove: (id: string) => void
}) => {
    return (
        <div 
            className="absolute z-50 group"
            style={{
                left: edit.x * scale,
                top: edit.y * scale,
                minWidth: edit.width * scale,
                minHeight: edit.height * scale,
            }}
        >
            <textarea
                autoFocus
                value={edit.text}
                onChange={(e) => onUpdate(edit.id, e.target.value)}
                className="bg-white border border-transparent focus:border-blue-500 rounded-sm resize-none overflow-hidden outline-none shadow-none focus:shadow-sm p-0 m-0 block"
                style={{
                    fontSize: `calc(${edit.fontSize} * ${scale})`,
                    fontFamily: edit.fontFamily,
                    color: edit.color,
                    fontWeight: edit.fontWeight,
                    fontStyle: edit.fontStyle,
                    letterSpacing: edit.letterSpacing,
                    lineHeight: edit.lineHeight,
                    width: '100%',
                    height: '100%',
                    minHeight: edit.height * scale,
                    whiteSpace: 'pre-wrap'
                }}
            />
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(edit.id) }}
                className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-50 scale-75"
            >
                <span className="sr-only">Remove</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    )
}

// Draggable Component
const DraggableSignature = ({ 
    pos, 
    scale, 
    signatureUrl, 
    onUpdate, 
    onRemove,
    onSpread
}: { 
    pos: Position, 
    scale: number, 
    signatureUrl: string, 
    onUpdate: (id: string, newX: number, newY: number) => void,
    onRemove: (id: string) => void,
    onSpread?: (id: string) => void
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    
    // We need to use refs for callbacks to avoid re-binding effects constantly while dragging
    // However, since we are passing `onUpdate` which is now memoized, it should be fine.
    
    const handleStart = (clientX: number, clientY: number, offsetX: number, offsetY: number) => {
        setIsDragging(true)
        setDragOffset({ x: offsetX, y: offsetY })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleStart(e.clientX, e.clientY, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
    
    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation() // Prevent scrolling
        const touch = e.touches[0]
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const offsetX = touch.clientX - rect.left
        const offsetY = touch.clientY - rect.top
        handleStart(touch.clientX, touch.clientY, offsetX, offsetY)
    }
    
    useEffect(() => {
        const handleMove = (clientX: number, clientY: number) => {
            if (!isDragging) return
            
            const parent = document.getElementById("pdf-page-container")
            if (!parent) return
            
            const rect = parent.getBoundingClientRect()
            
            // Calculate raw position
            let x = (clientX - rect.left - dragOffset.x) / scale
            let y = (clientY - rect.top - dragOffset.y) / scale
            
            // Boundary checks (optional, but good for "working fine")
            // Allow some overhang, but not completely lost.
            
            onUpdate(pos.id, x, y)
        }
        
        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX, e.clientY)
        }
        
        const handleTouchMove = (e: TouchEvent) => {
             e.preventDefault() // critical for drag on mobile
             const touch = e.touches[0]
             handleMove(touch.clientX, touch.clientY)
        }
        
        const handleEnd = () => {
            setIsDragging(false)
        }
        
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleEnd)
            window.addEventListener('touchmove', handleTouchMove, { passive: false })
            window.addEventListener('touchend', handleEnd)
        }
        
        return () => {
             window.removeEventListener('mousemove', handleMouseMove)
             window.removeEventListener('mouseup', handleEnd)
             window.removeEventListener('touchmove', handleTouchMove)
             window.removeEventListener('touchend', handleEnd)
        }
    }, [isDragging, dragOffset, scale, onUpdate, pos.id])

    return (
        <div 
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={cn(
                "absolute cursor-move group hover:ring-2 hover:ring-blue-500 rounded select-none touch-none",
                isDragging && "ring-2 ring-blue-500 z-50 shadow-xl opacity-80"
            )}
            style={{
                left: pos.x * scale,
                top: pos.y * scale,
                width: pos.width * scale,
                height: pos.height * scale,
                zIndex: isDragging ? 100 : 50
            }}
        >
            <img 
                src={signatureUrl} 
                className="w-full h-full object-contain pointer-events-none" 
                draggable={false}
            />
            <div className="absolute -top-3 -right-3 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                {onSpread && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSpread(pos.id) }}
                        onTouchEnd={(e) => { e.stopPropagation(); onSpread(pos.id) }} 
                        className="bg-blue-500 text-white rounded-full p-1 shadow-sm hover:bg-blue-600"
                        title="Replicate on all pages"
                    >
                        <span className="sr-only">Spread</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(pos.id) }}
                    onTouchEnd={(e) => { e.stopPropagation(); onRemove(pos.id) }} 
                    className="bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                >
                    <span className="sr-only">Remove</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
    )
}



  const [signatureMode, setSignatureMode] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const handlePdfClick = (e: React.MouseEvent) => {
    // If we are in Edit Mode, we want to detect clicks on Text Layer spans
    if (editMode && pageRef.current) {
        // Check if clicked target is a text span (or inside one)
        const target = e.target as HTMLElement
        const textSpan = target.closest('.react-pdf__Page__textContent span') as HTMLElement | null

        if (textSpan) {
            // It's a text item!
            const style = window.getComputedStyle(textSpan)
            const rect = textSpan.getBoundingClientRect()
            const parentRect = pageRef.current.getBoundingClientRect()
            
            // Avoid selecting empty or whitespace-only spans
            if (!textSpan.innerText.trim()) return

            // Hide the original text immediately to simulate "picking it up"
            textSpan.style.visibility = "hidden"

            const extracted = {
                id: Math.random().toString(36).substring(7),
                page: currentPage,
                x: (rect.left - parentRect.left) / scale,
                y: (rect.top - parentRect.top) / scale,
                width: rect.width / scale,
                height: rect.height / scale,
                text: textSpan.innerText,
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                color: style.color,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                lineHeight: style.lineHeight,
                letterSpacing: style.letterSpacing,
                pageWidth: pageDimensions?.width,
                pageHeight: pageDimensions?.height
            }
            
            setTextEdits([...textEdits, extracted])
            return 
        }
    }

    if (!signatureMode || !signature || !pageRef.current) return

    const rect = pageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Center the signature on the click
    const defaultWidth = 150
    const defaultHeight = 75
    
    const centeredX = (x / scale) - (defaultWidth / 2)
    const centeredY = (y / scale) - (defaultHeight / 2)
    
    const newPos = {
        id: Math.random().toString(36).substring(7),
        page: currentPage,
        x: centeredX, 
        y: centeredY,
        width: defaultWidth, 
        height: defaultHeight,
        pageWidth: pageDimensions?.width,
        pageHeight: pageDimensions?.height
    }
    
    setPositions([...positions, newPos])
    setSignatureMode(false) 
  }
  
  // Update position from drag - Memoized for permformance
  const handlePositionUpdate = useCallback((id: string, newX: number, newY: number) => {
      setPositions(prev => prev.map(p => 
          p.id === id ? { ...p, x: newX, y: newY } : p
      ))
  }, [])

  // Text Edit Handlers
  const handleTextUpdate = useCallback((id: string, newText: string) => {
      setTextEdits(prev => prev.map(t => 
          t.id === id ? { ...t, text: newText } : t
      ))
  }, [])
  
  const removeTextEdit = useCallback((id: string) => {
      setTextEdits(prev => prev.filter(t => t.id !== id))
  }, [])
  
  const handleSign = async () => {
    // Basic validation
    if (!file) return

    setIsSigning(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("signature", signature || "placeholder")
      formData.append("positions", JSON.stringify(positions))
      formData.append("textEdits", JSON.stringify(textEdits))

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
      setError(err instanceof Error ? err.message : "Signing failed")
    } finally {
      setIsSigning(false)
    }
  }

  const removePosition = useCallback((id: string) => {
      setPositions(prev => prev.filter(p => p.id !== id))
  }, [])
  
  const handleSpread = (id: string) => {
      const target = positions.find(p => p.id === id)
      if (!target) return
      
      const newEntries: Position[] = []
      for (let i = 1; i <= numPages; i++) {
          if (i === target.page) continue // Skip source page
          
          newEntries.push({
              ...target,
              id: `spread-${i}-${Date.now()}`,
              page: i
          })
      }
      
      setPositions([...positions, ...newEntries])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-full md:w-96 bg-white border-r p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-lg">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="mr-2">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Sign & Edit
                    </h1>
                    <p className="text-sm text-gray-500">Secure PDF Signing</p>
                </div>
            </div>

            {!file ? (
                <Card className="p-6 border-dashed border-2">
                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-semibold truncate text-blue-900">{file.name}</p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setFile(null); setResult(null); setPositions([]) }} 
                            className="text-red-500 hover:text-red-700 p-0 h-auto mt-2"
                        >
                            Change File
                        </Button>
                    </div>
                    
                    {/* Position Summary */}
                    {positions.length > 0 && (
                        <div className="bg-gray-100 p-3 rounded text-xs">
                            <h4 className="font-semibold mb-1">Signatures Placed: {positions.length}</h4>
                            <p className="text-gray-500">Drag signatures on the document to adjust position.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">1. Tools</h3>
                        
                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setEditMode(v === 'edit_text'); setSignatureMode(false) }} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="draw" title="Draw Signature"><PenTool size={16}/></TabsTrigger>
                                <TabsTrigger value="type" title="Type Signature"><Type size={16}/></TabsTrigger>
                                <TabsTrigger value="upload" title="Upload Image"><Upload size={16}/></TabsTrigger>
                                <TabsTrigger value="edit_text" title="Edit Text"><Edit3 size={16}/></TabsTrigger>
                            </TabsList>
                            
                            <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 min-h-[150px] flex flex-col justify-center">
                                <TabsContent value="draw" className="mt-0">
                                    <div className="p-2 text-center text-xs text-muted-foreground mb-2">Draw your signature below</div>
                                    <SignaturePad onSignatureChange={setSignature} />
                                </TabsContent>
                                
                                <TabsContent value="type" className="p-4 space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <Label>Type your name / initials</Label>
                                        <Input 
                                            placeholder="John Doe" 
                                            value={typedName}
                                            onChange={(e) => {
                                                setTypedName(e.target.value)
                                            }}
                                            onBlur={generateTextSignatures}
                                        />
                                        <p className="text-xs text-muted-foreground">Click away to generate signature options</p>
                                    </div>
                                    
                                    {variants.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    {variants.map((v, i) => (
                                            <div 
                                                key={i} 
                                                className={cn("border p-2 rounded cursor-pointer hover:bg-blue-50 transition", signature === v && "ring-2 ring-blue-500 bg-blue-50")}
                                                onClick={() => setSignature(v)}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData("signatureUrl", v)
                                                    e.dataTransfer.effectAllowed = "copy"
                                                    setSignature(v) // Auto-select on drag
                                                }}
                                            >
                                                <img src={v} className="h-8 object-contain mx-auto pointer-events-none"/>
                                            </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button size="sm" onClick={generateTextSignatures} disabled={!typedName} className="w-full">
                                        Generate Signatures
                                    </Button>
                                </TabsContent>
                                
                                <TabsContent value="upload" className="p-4 space-y-4 mt-0">
                                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded bg-white">
                                        <Label htmlFor="sig-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <ImageIcon className="text-gray-400" size={32}/>
                                            <span className="text-sm text-blue-600 font-medium">Click to upload image</span>
                                        </Label>
                                        <Input 
                                            id="sig-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleSignatureUpload}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="edit_text" className="p-4 space-y-4 mt-0">
                                    <div className="text-center space-y-4">
                                        <div className="bg-blue-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-blue-600">
                                            <Edit3 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Edit Mode Active</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Click on any text in the document to edit it.
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Preview of current signature */}
                        {signature && (
                             <div className="mt-2 p-2 border rounded bg-white flex justify-between items-center">
                                <img src={signature} className="h-8 object-contain" />
                                <span className="text-xs text-green-600 flex items-center font-medium">
                                    <Check size={12} className="mr-1"/> Ready to place
                                </span>
                             </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">2. Place on Document</h3>
                        
                        <div className="grid grid-cols-2 gap-2">
                             <Button 
                                onClick={() => setSignatureMode(!signatureMode)} 
                                variant={signatureMode ? "default" : "outline"}
                                className={cn(signatureMode && "bg-blue-600 text-white")}
                                disabled={!signature}
                             >
                                 <Move size={16} className="mr-2"/> {signatureMode ? "Click PDF" : "Drop Place"}
                             </Button>
                             
                             <Button
                                onClick={() => {
                                    if (!signature) return
                                    // Find a "template" signature on the current page
                                    const template = positions.find(p => p.page === currentPage)
                                    
                                    if (!template) {
                                        alert("Please place a signature on the current page first to define the position.")
                                        return
                                    }

                                    const allPagesPos: Position[] = []
                                    for (let i = 1; i <= numPages; i++) {
                                        if (i === currentPage) continue // Don't duplicate current page
                                        
                                        allPagesPos.push({
                                            id: `auto-${i}-${Date.now()}`,
                                            page: i,
                                            x: template.x, 
                                            y: template.y, 
                                            width: template.width,
                                            height: template.height,
                                            pageWidth: template.pageWidth,
                                            pageHeight: template.pageHeight
                                        })
                                    }
                                    setPositions([...positions, ...allPagesPos])
                                }}
                                variant="outline"
                                disabled={!signature || positions.filter(p => p.page === currentPage).length === 0}
                                title="Place one signature first, then click this to copy it to all pages"
                             >
                                 Sign All Pages
                             </Button>
                        </div>
                    </div>
                    
                    {!result ? (
                        <Button
                            onClick={handleSign}
                            disabled={!file || !signature || isSigning}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg"
                        >
                            {isSigning ? (
                                <>
                                <Loader2 className="mr-2 animate-spin" /> Signing...
                                </>
                            ) : "Finalize & Sign"}
                        </Button>
                    ) : (
                         <div className="space-y-4">
                             <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                 <p className="text-green-800 font-semibold mb-2">Success!</p>
                                 <a href={result.downloadUrl} download>
                                     <Button className="w-full bg-green-600 hover:bg-green-700">
                                         <Download className="mr-2" size={18} /> Download Signed PDF
                                     </Button>
                                 </a>
                             </div>
                             <Button variant="outline" onClick={() => setResult(null)} className="w-full">
                                 Sign Another
                             </Button>
                         </div>
                    )}
                    
                    {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
                </div>
            )}
        </div>

        {/* PDF Preview Area */}
        <div className="flex-1 bg-gray-200 overflow-auto relative flex justify-center items-start p-8">
            {file && (
                <div className="space-y-4 relative">
                    {/* Zoom Controls */}
                    <div className="sticky top-0 z-20 flex justify-center gap-2 mb-4">
                        <div className="bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut size={18}/></Button>
                            <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}><ZoomIn size={18}/></Button>
                        </div>
                        
                        <div className="bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-4">
                             <Button variant="ghost" size="icon" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft size={18}/></Button>
                             <span className="text-sm font-medium w-20 text-center">Page {currentPage} of {numPages}</span>
                             <Button variant="ghost" size="icon" disabled={currentPage >= numPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight size={18}/></Button>
                        </div>
                    </div>

                    <div 
                        id="pdf-page-container"
                        className={cn("shadow-2xl relative transition-cursor", signatureMode ? "cursor-crosshair" : (editMode ? "cursor-text" : "cursor-default"))} 
                        ref={pageRef}
                        onClick={handlePdfClick}
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = "copy"
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            const sigUrl = e.dataTransfer.getData("signatureUrl")
                            if (!sigUrl) return

                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const y = e.clientY - rect.top

                            const defaultWidth = 150
                            const defaultHeight = 75
                            
                            const centeredX = (x / scale) - (defaultWidth / 2)
                            const centeredY = (y / scale) - (defaultHeight / 2)

                            const newPos = {
                                id: Math.random().toString(36).substring(7),
                                page: currentPage,
                                x: centeredX, 
                                y: centeredY,
                                width: defaultWidth, 
                                height: defaultHeight,
                                pageWidth: pageDimensions?.width,
                                pageHeight: pageDimensions?.height
                            }
                            
                            setPositions(prev => [...prev, newPos])
                            setSignature(sigUrl) // Ensure it's active
                        }}
                    >
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="max-w-full"
                        >
                            <Page 
                                pageNumber={currentPage} 
                                scale={scale} 
                                renderTextLayer={true} 
                                renderAnnotationLayer={false}
                                onLoadSuccess={onPageLoadSuccess}
                                className="bg-white shadow-lg"
                                customTextRenderer={undefined}
                            />
                        </Document>
                         {/* Styles for Edit Mode */}
                         {editMode && (
                            <style jsx global>{`
                                .react-pdf__Page__textContent {
                                    top: 0 !important;
                                    left: 0 !important;
                                    transform: none !important;
                                    z-index: 20 !important;
                                    pointer-events: auto !important;
                                }
                                .react-pdf__Page__textContent span {
                                    cursor: text !important;
                                    pointer-events: auto !important;
                                }
                                .react-pdf__Page__textContent span:hover {
                                    background-color: rgba(59, 130, 246, 0.2);
                                    outline: 1px solid rgba(59, 130, 246, 0.5);
                                }
                            `}</style>
                        )}
                        
                        {/* Draggable Signatures Overlay */}
                        {positions.filter(p => p.page === currentPage).map((pos) => (
                             <DraggableSignature 
                                key={pos.id}
                                pos={pos}
                                scale={scale}
                                signatureUrl={signature}
                                onUpdate={handlePositionUpdate}
                                onRemove={removePosition}
                                onSpread={handleSpread}
                             />
                        ))}
                        
                        {/* Text Edits Overlay */}
                        {textEdits.filter(t => t.page === currentPage).map((edit) => (
                            <EditableText 
                                key={edit.id}
                                edit={edit}
                                scale={scale}
                                onUpdate={handleTextUpdate}
                                onRemove={removeTextEdit}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {!file && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Maximize2 size={64} className="mb-4 opacity-20" />
                    <p>Load a document to start editing</p>
                </div>
            )}
        </div>
    </div>
  )
}
