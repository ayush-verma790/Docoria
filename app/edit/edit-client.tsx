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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
    fontSize: number
    fontFamily: string
    color: string
    fontWeight: string
    fontStyle: string
    textDecoration: string
    align: 'left' | 'center' | 'right'
    pageWidth?: number
    pageHeight?: number
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
    
    const handleStart = (clientX: number, clientY: number, offsetX: number, offsetY: number) => {
        setIsDragging(true)
        setDragOffset({ x: offsetX, y: offsetY })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleStart(e.clientX, e.clientY, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
    
    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation()
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
            
            let x = (clientX - rect.left - dragOffset.x) / scale
            let y = (clientY - rect.top - dragOffset.y) / scale
            
            onUpdate(pos.id, x, y)
        }
        
        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX, e.clientY)
        }
        
        const handleTouchMove = (e: TouchEvent) => {
             e.preventDefault()
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

// Formatting Toolbar Component (Modern Dark Theme)
const FormattingToolbar = ({ 
    style, 
    onStyleChange,
    onRemove
}: { 
    style: TextEdit, 
    onStyleChange: (key: keyof TextEdit, value: any) => void,
    onRemove: () => void
}) => {
    return (
        <div 
            className="absolute -top-16 left-0 z-[100] flex items-center gap-2 bg-[#1e293b] text-white rounded-xl shadow-2xl border border-slate-700 p-2 min-w-max animate-in fade-in zoom-in-95 duration-200 select-none"
            onMouseDown={(e) => e.stopPropagation()} 
        >
            {/* Font Control */}
            <div className="flex items-center gap-2 border-r border-slate-600 pr-2 mr-1">
                <select 
                    value={style.fontFamily.includes('Times') ? 'serif' : style.fontFamily.includes('Courier') ? 'monospace' : 'sans-serif'}
                    onChange={(e) => onStyleChange('fontFamily', e.target.value)}
                    className="h-8 text-xs font-medium bg-slate-800 border border-slate-600 rounded-lg px-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                </select>
                <input 
                    type="number" 
                    value={style.fontSize}
                    onChange={(e) => onStyleChange('fontSize', Number(e.target.value))}
                    className="h-8 w-14 text-xs font-medium bg-slate-800 border border-slate-600 rounded-lg px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-slate-200"
                    min={6}
                    max={72}
                />
            </div>

            {/* Styling Controls */}
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => onStyleChange('fontWeight', style.fontWeight === 'bold' || Number(style.fontWeight) >= 700 ? 'normal' : 'bold')}
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-all", 
                        (style.fontWeight === 'bold' || Number(style.fontWeight) >= 700) 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "hover:bg-slate-700 text-slate-400 hover:text-white"
                    )}
                    title="Bold"
                >
                    <span className="font-bold text-xs">B</span>
                </button>
                <button 
                    onClick={() => onStyleChange('fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-all", 
                        style.fontStyle === 'italic' 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "hover:bg-slate-700 text-slate-400 hover:text-white"
                    )}
                    title="Italic"
                >
                    <span className="italic text-xs font-serif">I</span>
                </button>
                <div className="relative group w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border border-slate-500" style={{ backgroundColor: style.color }}></div>
                    <input 
                        type="color" 
                        value={style.color}
                        onChange={(e) => onStyleChange('color', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Alignment */}
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => onStyleChange('align', 'left')}
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-all", 
                        style.align === 'left' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-white"
                    )}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                </button>
                <button 
                    onClick={() => onStyleChange('align', 'center')}
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-all", 
                        style.align === 'center' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-white"
                    )}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="10" x2="7" y2="10"></line><line x1="19" y1="14" x2="5" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                </button>
                <button 
                    onClick={() => onStyleChange('align', 'right')}
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-all", 
                        style.align === 'right' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-white"
                    )}
                >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Actions */}
            <button 
                onClick={onRemove}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors border border-red-500/20"
                title="Delete Text"
            >
                <Trash2 size={14} />
            </button>
        </div>
    )
}

// Editable Text Component with Handles
const EditableText = ({ 
    edit, 
    scale, 
    onUpdate, 
    onRemove 
}: { 
    edit: TextEdit, 
    scale: number, 
    onUpdate: (id: string, updates: Partial<TextEdit>) => void,
    onRemove: (id: string) => void
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [edit.text, edit.fontSize, scale])

    const handleStyleChange = (key: keyof TextEdit, value: any) => {
        onUpdate(edit.id, { [key]: value })
    }

    // Handles for the visual "Adobe/Word" look
    const Handle = ({ className }: { className: string }) => (
        <div className={cn("absolute w-2.5 h-2.5 bg-blue-600 border border-white rounded-[1px] z-50 pointer-events-none", className)} />
    )

    return (
        <div 
            className={cn(
                "absolute z-40 group transition-all",
                isFocused ? "z-50" : "hover:z-50"
            )}
            style={{
                left: edit.x * scale,
                top: edit.y * scale,
                minWidth: Math.max(edit.width * scale, 50),
            }}
            onClick={(e) => { e.stopPropagation(); setIsFocused(true); }}
        >
            {isFocused && (
                <>
                    <FormattingToolbar 
                        style={edit} 
                        onStyleChange={handleStyleChange}
                        onRemove={() => onRemove(edit.id)}
                    />
                    
                    {/* Visual Handles */}
                    <Handle className="-top-1.5 -left-1.5" />
                    <Handle className="-top-1.5 left-1/2 -translate-x-1/2" />
                    <Handle className="-top-1.5 -right-1.5" />
                    
                    <Handle className="top-1/2 -left-1.5 -translate-y-1/2" />
                    <Handle className="top-1/2 -right-1.5 -translate-y-1/2" />
                    
                    <Handle className="-bottom-1.5 -left-1.5" />
                    <Handle className="-bottom-1.5 left-1/2 -translate-x-1/2" />
                    <Handle className="-bottom-1.5 -right-1.5" />
                </>
            )}
            
            <textarea
                ref={textareaRef}
                value={edit.text}
                onChange={(e) => onUpdate(edit.id, { text: e.target.value })}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    // Check if related target is within toolbar
                   if (!e.relatedTarget || !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                       setIsFocused(false)
                   }
                }}
                className={cn(
                    "resize-none overflow-hidden outline-none p-0.5 block w-full leading-normal text-start",
                    isFocused 
                        ? "ring-1 ring-blue-600 bg-white shadow-sm z-50 rounded-[1px]" 
                        : "hover:ring-1 hover:ring-blue-300 bg-white/0 hover:bg-white/90 border border-transparent"
                )}
                style={{
                    fontSize: `${edit.fontSize * scale}px`,
                    fontFamily: edit.fontFamily,
                    color: edit.color,
                    fontWeight: edit.fontWeight,
                    fontStyle: edit.fontStyle,
                    textAlign: edit.align,
                    textDecoration: edit.textDecoration,
                    minHeight: edit.height * scale,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.15
                }}
            />
        </div>
    )
}

export default function EditClient() {
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
  const [activeTab, setActiveTab] = useState("edit_mode") // Default to Edit
  
  // Generated variants
  const [variants, setVariants] = useState<string[]>([])
  
  const pageRef = useRef<HTMLDivElement>(null)
  
  // Toggle visual boundaries for text
  const [showBoundaries, setShowBoundaries] = useState(true)

  const [signatureMode, setSignatureMode] = useState(false)
  const [editMode, setEditMode] = useState(true)
  
  // When entering Edit Mode, enable boundaries
  useEffect(() => {
    if (activeTab === 'edit_mode') {
        setShowBoundaries(false) // Clean look by default
        setEditMode(true)
        setSignatureMode(false)
    } else {
        setShowBoundaries(false)
        setEditMode(false)
    }
  }, [activeTab])
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    // Configure PDF.js worker only on client
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

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
       if (!signature && newVariants.length > 0) {
           setSignature(newVariants[0])
       }
  }
  
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



  const handlePdfClick = (e: React.MouseEvent) => {
    if (editMode && pageRef.current) {
        const target = e.target as HTMLElement
        const textSpan = target.closest('.react-pdf__Page__textContent span') as HTMLElement | null

        if (textSpan) {
            const style = window.getComputedStyle(textSpan)
            const rect = textSpan.getBoundingClientRect()
            const parentRect = pageRef.current.getBoundingClientRect()
            
            // if (!textSpan.innerText.trim()) return // Allow editing even empty spans if they exist physically

            // Helper to parse color
            const getRgbColor = (colorStr: string) => {
                // Determine if it's black or close to it
                return colorStr
            }

            textSpan.style.visibility = "hidden"

            const extracted: TextEdit = {
                id: Math.random().toString(36).substring(7),
                page: currentPage,
                x: (rect.left - parentRect.left) / scale,
                y: (rect.top - parentRect.top) / scale,
                width: (rect.width / scale) + 12, // Add buffer to prevent premature wrapping
                height: rect.height / scale,
                text: textSpan.innerText,
                fontSize: parseFloat(style.fontSize) || 12,
                fontFamily: style.fontFamily,
                color: style.color,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                textDecoration: style.textDecorationLine,
                align: 'left',
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
    const defaultWidth = 150
    const defaultHeight = 75
    const centeredX = (x / scale) - (defaultWidth / 2)
    const centeredY = (y / scale) - (defaultHeight / 2)
    
    // Check if user clicked to ADD new text (if in text edit mode but not on existing text)
    if (editMode) {
        const newText: TextEdit = {
            id: Math.random().toString(36).substring(7),
            page: currentPage,
            x: x / scale,
            y: y / scale,
            width: 200,
            height: 24,
            text: "Type here...",
            fontSize: 12,
            fontFamily: "sans-serif",
            color: "#000000",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            align: 'left',
            pageWidth: pageDimensions?.width,
            pageHeight: pageDimensions?.height
        }
        setTextEdits([...textEdits, newText])
        return
    }
    
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
  
  const handlePositionUpdate = useCallback((id: string, newX: number, newY: number) => {
      setPositions(prev => prev.map(p => 
          p.id === id ? { ...p, x: newX, y: newY } : p
      ))
  }, [])

  const handleTextUpdate = useCallback((id: string, updates: Partial<TextEdit>) => {
      setTextEdits(prev => prev.map(t => 
          t.id === id ? { ...t, ...updates } : t
      ))
  }, [])
  
  const removeTextEdit = useCallback((id: string) => {
      setTextEdits(prev => prev.filter(t => t.id !== id))
  }, [])
  
  const handleSign = async () => {
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
          if (i === target.page) continue
          newEntries.push({
              ...target,
              id: `spread-${i}-${Date.now()}`,
              page: i
          })
      }
      setPositions([...positions, ...newEntries])
  }

  return (
    <div className="dark min-h-screen bg-background flex flex-col md:flex-row h-screen overflow-hidden text-foreground pt-20">
        {/* Left Panel */}
        <div className="w-full md:w-96 bg-card border-r border-border p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-lg">
             {/* Header */}
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="mr-2">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            PDF Editor
                        </h1>
                        <p className="text-sm text-muted-foreground">Edit text & sign documents</p>
                    </div>
                </div>
            </div>

            {!file ? (
                <Card className="p-6 border-dashed border-2">
                    <FileUploader onFileSelect={(files) => setFile(files[0])} accept=".pdf" />
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* File Info */}
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="font-semibold truncate text-primary">{file.name}</p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setFile(null); setResult(null); setPositions([]) }} 
                            className="text-red-500 hover:text-red-700 p-0 h-auto mt-2"
                        >
                            Change File
                        </Button>
                    </div>
                    
                    {positions.length > 0 && (
                        <div className="bg-muted p-3 rounded text-xs">
                            <h4 className="font-semibold mb-1">Signatures Placed: {positions.length}</h4>
                            <p className="text-muted-foreground">Drag signatures on the document to adjust position.</p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="edit_mode" className="gap-2">
                                    <Edit3 size={16} /> Edit Text
                                </TabsTrigger>
                                <TabsTrigger value="sign_mode" className="gap-2">
                                    <PenTool size={16} /> Sign & Fill
                                </TabsTrigger>
                            </TabsList>
                            
                            <div className="mt-4 border border-border rounded-lg overflow-hidden bg-card min-h-[150px] flex flex-col">
                                <TabsContent value="edit_mode" className="p-4 space-y-4 mt-0">
                                    <div className="text-center space-y-4">
                                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-blue-600 shadow-sm animate-in zoom-in duration-300">
                                            <Edit3 size={32} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-lg">Edit PDF Content</h4>
                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                Click directly on any text in the document to edit it. 
                                                <br/>
                                                <span className="text-xs text-gray-500">(Word-like editing enabled)</span>
                                            </p>
                                        </div>
                                        
                                        {/* <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 py-2 rounded">
                                            <Grid size={14} />
                                            <span>Text boundaries visible</span>
                                        </div> */}
                                    </div>
                                </TabsContent>

                                <TabsContent value="sign_mode" className="p-4 space-y-4 mt-0">
                                     <Tabs defaultValue="draw" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 bg-white border">
                                            <TabsTrigger value="draw" title="Draw"><PenTool size={14}/></TabsTrigger>
                                            <TabsTrigger value="type" title="Type"><Type size={14}/></TabsTrigger>
                                            <TabsTrigger value="upload" title="Upload"><Upload size={14}/></TabsTrigger>
                                        </TabsList>
                                        
                                        <div className="mt-4">
                                            <TabsContent value="draw" className="mt-0">
                                                <div className="text-xs text-center text-gray-500 mb-2">Draw Signature</div>
                                                <SignaturePad onSignatureChange={setSignature} />
                                            </TabsContent>
                                            
                                            <TabsContent value="type" className="mt-0 space-y-4">
                                                <div className="space-y-2">
                                                    <Input 
                                                        placeholder="Type your name..." 
                                                        value={typedName}
                                                        onChange={(e) => setTypedName(e.target.value)}
                                                        onBlur={generateTextSignatures}
                                                    />
                                                </div>
                                                {variants.length > 0 && (
                                                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                                        {variants.map((v, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={cn("border p-2 rounded cursor-pointer hover:bg-blue-50", signature === v && "ring-1 ring-blue-500 bg-blue-50")}
                                                                onClick={() => setSignature(v)}
                                                            >
                                                                <img src={v} className="h-6 object-contain mx-auto" alt="signature variant"/>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <Button size="sm" onClick={generateTextSignatures} disabled={!typedName} variant="outline" className="w-full h-8">
                                                    Generate
                                                </Button>
                                            </TabsContent>
                                            
                                            <TabsContent value="upload" className="mt-0">
                                                <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded bg-white hover:bg-gray-50 transition-colors">
                                                    <Label htmlFor="sig-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                        <ImageIcon className="text-gray-400" size={24}/>
                                                        <span className="text-xs text-blue-600">Upload Image</span>
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
                                        </div>
                                     </Tabs>
                                     
                                    {signature && (
                                        <div className="p-2 border rounded bg-white flex justify-between items-center animate-in slide-in-from-top-2">
                                            <img src={signature} className="h-6 object-contain" alt="Selected signature" />
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Ready</Badge>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button 
                                            onClick={() => setSignatureMode(!signatureMode)} 
                                            variant={signatureMode ? "default" : "outline"}
                                            className={cn("h-9", signatureMode && "bg-blue-600")}
                                            disabled={!signature}
                                        >
                                            <Move size={14} className="mr-2"/> {signatureMode ? "Placing..." : "Place"}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (!signature) return
                                                const template = positions.find(p => p.page === currentPage)
                                                if (!template) return alert("Place signature first")
                                                
                                                const newEntries: Position[] = []
                                                for (let i = 1; i <= numPages; i++) {
                                                    if (i === template.page) continue
                                                    newEntries.push({
                                                        ...template,
                                                        id: `spread-${i}-${Date.now()}`,
                                                        page: i
                                                    })
                                                }
                                                setPositions([...positions, ...newEntries])
                                            }}
                                            variant="outline"
                                            className="h-9"
                                            disabled={!signature}
                                        >
                                            Sign All
                                        </Button>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {!result ? (
                        <Button
                            onClick={handleSign}
                            disabled={!file || !signature || isSigning}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg"
                        >
                            {isSigning ? (
                                <><Loader2 className="mr-2 animate-spin" /> Processing...</>
                            ) : (activeTab === 'edit_mode' ? "Save Changes" : "Sign & Download")}
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

        {/* Right Panel */}
        <div className="flex-1 bg-muted/30 overflow-auto relative flex justify-center items-start p-8">
            {file && (
                <div className="space-y-4 relative">
                    <div className="sticky top-0 z-20 flex justify-center gap-2 mb-4">
                        <div className="bg-background/80 backdrop-blur shadow-lg border border-border rounded-full px-4 py-2 flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut size={18}/></Button>
                            <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}><ZoomIn size={18}/></Button>
                        </div>
                        
                        <div className="bg-background/80 backdrop-blur shadow-lg border border-border rounded-full px-4 py-2 flex items-center gap-4">
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
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
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
                            />
                        </Document>
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
                                    border: 1px solid transparent; /* Invisible by default */
                                    border-radius: 2px;
                                    transition: all 0.1s;
                                }
                                .react-pdf__Page__textContent span:hover {
                                    background-color: rgba(59, 130, 246, 0.05);
                                    border-color: rgba(59, 130, 246, 0.3); /* Subtle blue on hover */
                                    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
                                }
                            `}</style>
                        )}
                        
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
