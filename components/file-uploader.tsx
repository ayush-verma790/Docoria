"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
}

export function FileUploader({
  onFileSelect,
  accept = ".pdf,.docx,.jpg,.png,.webp",
  maxSize = 512 * 1024 * 1024,
  multiple = true
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`)
        return false
      }
      return true
    })

    onFileSelect(newFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-border bg-card/50 hover:border-primary/30 hover:bg-card/80"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
             handleFiles(e.target.files)
             // Reset value so the same file can be selected again if needed
             if (e.target) e.target.value = ''
          }}
          className="hidden"
        />
        
        <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                dragActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-primary"
            }`}>
                <Upload size={32} />
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Drop files or click to upload</p>
            <p className="text-sm text-muted-foreground font-medium">Compatible with PDF, DOCX, JPG, PNG, WEBP</p>
        </div>
      </div>
    </div>
  )
}
