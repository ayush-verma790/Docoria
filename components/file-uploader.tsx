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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className="mx-auto mb-4 text-gray-400" size={32} />
        <p className="text-lg font-medium text-gray-700">Drop files or click to upload</p>
        <p className="text-sm text-gray-500">PDF, DOCX, JPG, PNG, WEBP (max 50MB)</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <File size={20} className="text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                </div>
              </div>
              <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
