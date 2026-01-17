"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Layers, Sun, Moon } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-6xl bg-background/70 backdrop-blur-xl border border-border/50 rounded-full shadow-lg transition-all duration-300">
            <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-110 transition-all duration-300 ring-2 ring-white/10 dark:ring-white/5">
                       <Layers size={18} strokeWidth={3} className="md:w-5 md:h-5" />
                   </div>
                   <span className="text-foreground font-bold text-lg md:text-xl tracking-tight hidden sm:block">Docorio</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { name: "Convert", href: "/convert" },
                        { name: "Compress", href: "/compress" },
                        { name: "Edit", href: "/edit" },
                        { name: "Chat AI", href: "/chat-pdf" },
                        { name: "Merge", href: "/merge" },
                    ].map((item) => (
                        <Link key={item.name} href={item.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                     {mounted && (
                         <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Toggle theme"
                         >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                         </button>
                     )}
                     
                     <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                        Sign In
                     </Link>
                     <Link href="/convert">
                         <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-bold h-9 md:h-10 px-5 md:px-6 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs md:text-sm">
                             Get Started
                         </Button>
                     </Link>
                     <button 
                        className="md:hidden text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors active:scale-95" 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                     >
                         {isOpen ? <X size={20} /> : <Menu size={20} />}
                     </button>
                </div>
            </div>
        </div>
      </header>
      {/* Mobile Menu Implementation... (kept simple for brevity in this update, assuming it follows similar logic) */}

      <AnimatePresence>
          {isOpen && (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: -20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: -20 }}
                 className="fixed top-24 left-4 right-4 z-40 bg-[#0A0A0F]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden md:hidden start-0"
              >
                  <nav className="flex flex-col p-6 gap-2">
                    {[
                        { name: "Convert PDF", href: "/convert" },
                        { name: "Compress PDF", href: "/compress" },
                        { name: "Edit PDF", href: "/edit" },
                        { name: "Chat with PDF", href: "/chat-pdf" },
                        { name: "Merge PDF", href: "/merge" },
                        { name: "All Tools", href: "/" },
                    ].map((item) => (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className="flex items-center justify-between px-4 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all" 
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                            <Layers size={16} className="text-gray-600" />
                        </Link>
                    ))}
                    <div className="pt-4 mt-2 border-t border-white/5">
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 text-gray-400 font-medium hover:text-white">
                            Sign In
                        </Link>
                    </div>
                  </nav>
              </motion.div>
          )}
      </AnimatePresence>
    </>
  )
}
