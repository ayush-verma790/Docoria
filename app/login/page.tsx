"use client"

import type React from "react"
import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Layers, Shield, ArrowRight, FileText, Image as ImageIcon, FileSpreadsheet, FileCode, File } from "lucide-react"

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div 
      className="dark min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans relative overflow-hidden flex items-center justify-center px-4"
      onMouseMove={handleMouseMove}
    >
      {/* Background Ambience & Floating Docs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <motion.div 
          className="absolute w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[140px]"
          animate={{
            x: mousePosition.x * 0.05,
            y: mousePosition.y * 0.05,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 400 }}
          style={{ top: '20%', left: '20%' }}
        />
        
        {/* Floating Documents Animation */}
        <FloatingDocs />

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
              <Layers size={24} />
            </div>
            <span className="text-white font-black text-3xl tracking-tighter italic">DOCORIO</span>
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Welcome Back</h1>
          <p className="text-slate-400 font-medium italic uppercase tracking-widest text-[10px]">Your professional document workspace</p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Form...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

function FloatingDocs() {
  const docs = [
    { Icon: FileText, color: "text-blue-500", x: "10%", y: "20%", delay: 0 },
    { Icon: ImageIcon, color: "text-purple-500", x: "80%", y: "15%", delay: 2 },
    { Icon: FileSpreadsheet, color: "text-green-500", x: "15%", y: "70%", delay: 1 },
    { Icon: FileCode, color: "text-orange-500", x: "85%", y: "80%", delay: 3 },
    { Icon: File, color: "text-pink-500", x: "50%", y: "50%", delay: 4 }, // Center deep
  ]

  return (
    <>
      {docs.map((doc, i) => (
        <motion.div
          key={i}
          className={`absolute ${doc.color} opacity-20`}
          initial={{ x: doc.x, y: doc.y, scale: 0.8 }}
          animate={{
            y: ["0%", "-5%", "0%"],
            rotate: [0, 5, -5, 0],
            scale: [0.8, 0.9, 0.8],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: doc.delay,
          }}
          style={{ left: doc.x, top: doc.y }}
        >
          <doc.Icon size={48 + i * 10} />
        </motion.div>
      ))}
      
      {/* Small Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
           key={`p-${i}`}
           className="absolute w-1 h-1 bg-indigo-500/30 rounded-full"
           initial={{ 
             x: Math.random() * 100 + "%", 
             y: Math.random() * 100 + "%" 
           }}
           animate={{
             y: [0, Math.random() * -100, 0],
             opacity: [0, 0.5, 0]
           }}
           transition={{
             duration: 10 + Math.random() * 10,
             repeat: Infinity,
             delay: Math.random() * 5
           }}
        />
      ))}
    </>
  )
}

function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-8 sm:p-12 bg-slate-900 border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl bg-opacity-80">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Email Address</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-medium"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
            <Link href="#" className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.1em] hover:text-indigo-300 transition-colors">Forgot?</Link>
          </div>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-medium"
            required
          />
        </div>
        
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
            <Shield size={14} className="shrink-0" />
            {error}
          </div>
        )}
        
        <Button 
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black italic rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-lg uppercase tracking-tight group" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Sign In</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
      
      <div className="mt-10 pt-8 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          No account?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-indigo-400 hover:after:w-full after:transition-all">
            Join Docorio Free
          </Link>
        </p>
      </div>
    </Card>
  )
}
