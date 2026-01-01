"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsLoading(true)
    setError("")

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Upload failed")
        }
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
        <p className="text-gray-600 mb-8">Select one or more files to process</p>

        <Card className="p-8">
          <FileUploader onFileSelect={setFiles} />

          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <div className="flex gap-4 mt-8">
            <Button onClick={() => router.back()} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
