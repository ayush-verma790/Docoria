"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Menu, X, Layers } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
           <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform duration-500">
               <Layers size={20} />
           </div>
           <span className="text-white font-black text-2xl tracking-tighter italic">DOCORIO</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
            {[
                { name: "Compress", href: "/compress" },
                { name: "Convert", href: "/convert" },
                { name: "Edit", href: "/edit" },
                { name: "Merge", href: "/merge" },
            ].map((item) => (
                <Link key={item.name} href={item.href} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    {item.name}
                </Link>
            ))}
        </nav>

        <div className="flex items-center gap-4">
             <Link href="/login" className="hidden md:block text-sm text-slate-400 hover:text-white">Sign In</Link>
             <Link href="/register">
                 <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 font-bold">
                     Get Started
                 </Button>
             </Link>
             <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
                 {isOpen ? <X /> : <Menu />}
             </button>
        </div>
      </div>

      <AnimatePresence>
          {isOpen && (
              <motion.div 
                 initial={{ height: 0, opacity: 0 }} 
                 animate={{ height: "auto", opacity: 1 }} 
                 exit={{ height: 0, opacity: 0 }}
                 className="md:hidden border-t border-white/5 bg-slate-900 overflow-hidden"
              >
                  <nav className="flex flex-col p-4 gap-2">
                    {[
                        { name: "Compress", href: "/compress" },
                        { name: "Convert", href: "/convert" },
                        { name: "Edit", href: "/edit" },
                        { name: "Merge", href: "/merge" },
                        { name: "Tools", href: "/" },
                    ].map((item) => (
                        <Link key={item.name} href={item.href} className="px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg" onClick={() => setIsOpen(false)}>
                            {item.name}
                        </Link>
                    ))}
                  </nav>
              </motion.div>
          )}
      </AnimatePresence>
    </header>
  )
}
