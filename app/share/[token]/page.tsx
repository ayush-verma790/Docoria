"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Eye } from "lucide-react"

interface SharedFile {
  id: number
  filename: string
  fileSize: number
  fileType: string
  viewOnly: boolean
  expiresAt: string | null
}

export default function SharedFilePage() {
  const params = useParams()
  const token = params.token as string
  const [file, setFile] = useState<SharedFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`/api/share/${token}`)
        if (!res.ok) throw new Error("File not found or access denied")
        const data = await res.json()
        setFile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedFile()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 font-semibold">{error || "File not found"}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Document Shared With You</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <p className="text-2xl font-semibold text-gray-900">{file.filename}</p>
              <p className="text-gray-600">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>

              {file.expiresAt && (
                <p className="text-sm text-orange-600">Link expires: {new Date(file.expiresAt).toLocaleDateString()}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                {file.viewOnly ? (
                  <>
                    <Eye size={20} />
                    <span>View Only</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Available</span>
                  </>
                )}
              </div>
            </div>

            {!file.viewOnly && (
              <a href={`/api/download/${token}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2" size={20} />
                  Download File
                </Button>
              </a>
            )}

            <p className="text-sm text-gray-500">This is a secure shared link. Do not share this URL publicly.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
