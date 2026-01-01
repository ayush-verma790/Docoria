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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
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

    setSelectedFiles((prev) => [...prev, ...newFiles])
    onFileSelect([...selectedFiles, ...newFiles])
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

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
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
            ? "border-indigo-500 bg-indigo-500/10" 
            : "border-white/10 bg-slate-950/50 hover:border-indigo-500/30 hover:bg-slate-950/80"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                dragActive ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-indigo-400"
            }`}>
                <Upload size={32} />
            </div>
            <p className="text-xl font-bold text-white mb-2">Drop files or click to upload</p>
            <p className="text-sm text-slate-500 font-medium">Compatible with PDF, DOCX, JPG, PNG, WEBP</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selected Files</h4>
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400">
                    <File size={20} />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                }} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
