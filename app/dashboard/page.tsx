"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Download, Share2, Trash2, FileUp, Zap, Signature, Shuffle, 
  LogOut, Shield, Edit3, Loader2, Clock, FileText, 
  CheckCircle, Layout, Table, Presentation, MoreVertical
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Document {
  id: number
  original_filename: string
  original_size: number
  compressed_size: number | null
  file_path: string
  created_at: string
  file_type: string
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, usageRes] = await Promise.all([
          fetch("/api/documents"), 
          fetch("/api/usage")
        ])

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
        toast.error("Failed to load dashboard data")
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

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return
    
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setDocuments(docs => docs.filter(d => d.id !== docId))
      toast.success("Document deleted successfully")
    } catch (err) {
      toast.error("Error deleting document")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-indigo-500 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        <p className="text-slate-300 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Workspace</p>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans"
      onMouseMove={handleMouseMove}
    >
      <SiteHeader />
      
      {/* Background Ambience - Consistent with Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div 
          className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] transition-transform duration-700 ease-out"
          style={{ 
            transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)` 
          }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-4 uppercase">Your Workspace</h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
              Welcome back. Manage your processed documents and monitor your daily limits from one central hub.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="h-14 px-8 rounded-2xl border-white/5 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-slate-300 font-bold transition-all"
            >
                <LogOut className="mr-3" size={18} />
                LOG OUT
            </Button>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Action Cards - Tool-style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "New Upload", icon: FileUp, href: "/upload", color: "text-blue-400" },
                { label: "Compress", icon: Zap, href: "/compress", color: "text-indigo-400" },
                { label: "PDF to Excel", icon: Table, href: "/pdf-to-excel", color: "text-emerald-400" },
                { label: "PDF to PPT", icon: Presentation, href: "/pdf-to-pptx", color: "text-orange-400" },
              ].map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={action.href} className="group block h-full">
                    <Card className="h-full p-8 flex flex-col items-center justify-center bg-slate-900 border-white/5 rounded-[2.5rem] hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all text-center">
                      <div className={cn("p-5 rounded-3xl bg-slate-950 border border-white/5 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500", action.color)}>
                        <action.icon size={28} />
                      </div>
                      <span className="font-black italic uppercase tracking-tighter text-lg">{action.label}</span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Document Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
                <Card className="bg-slate-900 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-10 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tight uppercase">Recent Processing</h2>
                                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">History • {documents.length} Files</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {documents.length === 0 ? (
                            <div className="py-24 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 relative">
                                    <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full animate-pulse" />
                                    <FileText className="text-slate-700 relative z-10" size={48} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white text-2xl font-black italic uppercase tracking-tight">Workspace is empty</p>
                                    <p className="text-slate-400 font-medium max-w-xs mx-auto">Upload your files to start the transformation process.</p>
                                </div>
                                <Link href="/upload">
                                    <Button className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black italic rounded-2xl transition-all shadow-xl shadow-indigo-600/20">
                                        UPLOAD NOW
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <motion.div
                                        key={doc.id}
                                        layout
                                        className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                                                <FileText className="text-indigo-400" size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-xl text-white truncate mb-1">{doc.original_filename}</p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500 tracking-wider uppercase">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500/50" /> {new Date(doc.created_at).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="text-slate-400">{(doc.original_size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-indigo-400 text-[10px] border border-white/5">{doc.file_type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center ml-4">
                                            <a href={doc.file_path} download className="hidden sm:block">
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                                                    <Download size={20} />
                                                </Button>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch(`/api/documents/${doc.id}/share`, { method: "POST" })
                                                        const data = await res.json()
                                                        const shareUrl = `${window.location.origin}/share/${data.token}`
                                                        await navigator.clipboard.writeText(shareUrl)
                                                        toast.success("Share link copied to clipboard!")
                                                    } catch (err) {
                                                        toast.error("Failed to generate share link")
                                                    }
                                                }}
                                            >
                                                <Share2 size={20} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Account Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
                <Card className="p-8 bg-slate-900 border-white/5 rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000">
                        <Shield size={160} />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black italic tracking-tight uppercase mb-8 flex items-center gap-3">
                            <Shield className="text-indigo-400" size={24} />
                            Daily Usage
                        </h2>
                        
                        <div className="space-y-8">
                            {[
                                { label: "Uploads", count: usage?.uploads_used || 0, limit: DAILY_LIMITS.uploads, color: "from-blue-500 to-blue-400" },
                                { label: "Compressions", count: usage?.compressions_used || 0, limit: DAILY_LIMITS.compressions, color: "from-indigo-600 to-indigo-400" },
                                { label: "Conversions", count: usage?.conversions_used || 0, limit: DAILY_LIMITS.conversions, color: "from-emerald-500 to-emerald-400" },
                                { label: "Edits", count: usage?.edits_used || 0, limit: DAILY_LIMITS.edits, color: "from-purple-600 to-purple-400" },
                                { label: "Signatures", count: usage?.signatures_used || 0, limit: DAILY_LIMITS.signatures, color: "from-amber-500 to-amber-400" },
                            ].map((stat) => (
                                <div key={stat.label} className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white leading-none">{stat.count}</span>
                                            <span className="text-xs font-bold text-slate-600">/ {stat.limit}</span>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-slate-950 rounded-full p-0.5 border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (stat.count / stat.limit) * 100)}%` }}
                                            className={cn("h-full rounded-full bg-gradient-to-r", stat.color)}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                <Zap size={22} fill="currentColor" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black italic uppercase text-white leading-none mb-1">Docorio Pro</p>
                                <p className="text-slate-500 text-xs font-medium">Remove limits & secure 1GB storage.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Pro Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group"
            >
                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex px-4 py-1 rounded-full bg-white/20 text-[10px] font-black tracking-[0.2em] uppercase">Limited Offer</div>
                        <h3 className="text-3xl font-black italic tracking-tighter leading-none uppercase">Go Unlimited <br /> with Pro</h3>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                            Processing thousands of pages? Unlock high-speed batch processing and dedicated API access today.
                        </p>
                        <Button className="w-full h-14 bg-white text-indigo-700 hover:bg-slate-100 font-black italic rounded-2xl shadow-xl transition-all active:scale-95 text-lg">
                            UPGRADE NOW
                        </Button>
                        <p className="text-center text-[10px] text-indigo-300/50 font-bold uppercase tracking-widest pt-2">Starting at $9.99/mo</p>
                    </div>
                </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
