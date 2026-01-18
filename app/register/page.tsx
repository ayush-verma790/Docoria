"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Layers, Shield, ArrowRight, User } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="dark min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans relative overflow-hidden flex items-center justify-center px-4 py-20"
      onMouseMove={handleMouseMove}
    >
      {/* Background Ambience */}
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

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
              <Layers size={24} />
            </div>
            <span className="text-white font-black text-3xl tracking-tighter italic">DOCORIO</span>
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Create Account</h1>
          <p className="text-slate-400 font-medium italic uppercase tracking-widest text-[10px]">Join 10,000+ professionals today</p>
        </div>

        <Card className="p-8 sm:p-10 bg-slate-900 border-white/5 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Full Name</label>
              <Input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Email Address</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-bold"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Password</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Confirm</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-14 bg-slate-950 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-white placeholder:text-slate-700 transition-all font-bold"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
                <Shield size={14} className="shrink-0" />
                {error}
              </div>
            )}
            
            <Button 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black italic rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-lg uppercase tracking-tight mt-4" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Start Free Trial</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign In Instead
              </Link>
            </p>
          </div>
        </Card>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
          By signing up, you agree to our <br />
          <Link href="#" className="underline hover:text-slate-400 transition-colors">Terms of Service</Link> & <Link href="#" className="underline hover:text-slate-400 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
