"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Share2, Trash2, FileUp, Zap, PenTool, Shuffle, DownloadIcon, LogOut, Shield, Edit3 } from "lucide-react"

interface Document {
  id: number
  original_filename: string
  original_size: number
  compressed_size: number | null
  file_path: string
  created_at: string
}

interface Usage {
  uploads_used: number
  compressions_used: number
  edits_used: number
  signatures_used: number
  conversions_used: number
}

const DAILY_LIMITS = {
  uploads: 10,
  compressions: 10,
  edits: 10,
  signatures: 10,
  conversions: 5,
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, usageRes] = await Promise.all([fetch("/api/documents"), fetch("/api/usage")])

        if (!docsRes.ok || !usageRes.ok) {
          router.push("/login")
          return
        }

        const docsData = await docsRes.json()
        const usageData = await usageRes.json()

        setDocuments(docsData)
        setUsage(usageData)
      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">DocProcess</h1>
          <Button onClick={handleLogout} variant="ghost" className="text-red-600">
            <LogOut className="mr-2" size={20} />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Usage Section */}
        {usage && (
          <Card className="p-6 mb-8 border-l-4 border-l-blue-500 shadow-md bg-gradient-to-r from-white to-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600"/> Daily Usage
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                  { label: "Uploads", count: usage.uploads_used, limit: DAILY_LIMITS.uploads, color: "text-blue-600" },
                  { label: "Compress", count: usage.compressions_used, limit: DAILY_LIMITS.compressions, color: "text-green-600" },
                  { label: "Edits", count: usage.edits_used, limit: DAILY_LIMITS.edits, color: "text-purple-600" },
                  { label: "Signatures", count: usage.signatures_used, limit: DAILY_LIMITS.signatures, color: "text-indigo-600" },
                  { label: "Convert", count: usage.conversions_used, limit: DAILY_LIMITS.conversions, color: "text-orange-600" },
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color}`}>
                      {stat.count}<span className="text-gray-300 text-lg">/{stat.limit}</span>
                    </p>
                  </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Link href="/upload" className="group">
            <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <FileUp size={24} />
              </div>
              <span className="font-semibold text-gray-700">Upload</span>
            </Card>
          </Link>
          <Link href="/compress" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-green-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-green-50 rounded-full text-green-600 mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                 <Zap size={24} />
              </div>
              <span className="font-semibold text-gray-700">Compress</span>
            </Card>
          </Link>
          <Link href="/resize" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-purple-50 rounded-full text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                 <Shuffle size={24} />
              </div>
              <span className="font-semibold text-gray-700">Resize</span>
            </Card>
          </Link>
          <Link href="/convert" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-orange-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-orange-50 rounded-full text-orange-600 mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                 <Shuffle size={24} />
              </div>
              <span className="font-semibold text-gray-700">Convert</span>
            </Card>
          </Link>
          <Link href="/sign" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-indigo-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <PenTool size={24} />
              </div>
              <span className="font-semibold text-gray-700">Sign</span>
            </Card>
          </Link>
          <Link href="/edit" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-cyan-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-cyan-50 rounded-full text-cyan-600 mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                 <Edit3 size={24} /> {/* Assuming Edit3 is imported or available, else check header */}
              </div>
              <span className="font-semibold text-gray-700">Edit</span>
            </Card>
          </Link>
          <Link href="/organize" className="group">
             <Card className="h-32 flex flex-col items-center justify-center bg-white border-2 border-transparent hover:border-pink-500 transition-all hover:shadow-lg group-hover:-translate-y-1">
              <div className="p-3 bg-pink-50 rounded-full text-pink-600 mb-3 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                 <Shuffle size={24} />
              </div>
              <span className="font-semibold text-gray-700">Organize</span>
            </Card>
          </Link>
        </div>

        {/* Documents List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No documents yet. Start by uploading a file!</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{doc.original_filename}</p>
                    <p className="text-sm text-gray-600">
                      {(doc.original_size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.file_path}>
                      <Button variant="ghost" size="sm">
                        <Download size={18} />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const res = await fetch(`/api/documents/${doc.id}/share`, { method: "POST" })
                        const data = await res.json()
                        alert(`Share link: ${window.location.origin}/share/${data.token}`)
                      }}
                    >
                      <Share2 size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (confirm("Delete this document?")) {
                          await fetch(`/api/documents/${doc.id}`, { method: "DELETE" })
                          setDocuments(documents.filter((d) => d.id !== doc.id))
                        }
                      }}
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
