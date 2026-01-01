"use client"

import Link from "next/link"
import { useState, MouseEvent, ReactNode, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  FileUp, Zap, Shield, Share2, FileText, Shuffle, PenTool, 
  ArrowRight, Check, Menu, X, Sparkles, Star, Lock, Settings, 
  Layers, Image as ImageIcon, Scissors, Hash, Unlock, Tag, 
  Hammer, FileImage, QrCode, Scan, Signature, RefreshCw,
  Cpu, Rocket, Eye, Globe, MessageSquare, ChevronDown,
  BarChart, Users, Laptop, Clock, Layout, Maximize,
  Wrench, Eraser, Table, Presentation
} from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  
  // Mouse effect for the glowing blob
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200"
      onMouseMove={handleMouseMove}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Docorio",
            "url": "https://docorio.com",
            "description": "Transform any file into a high-quality PDF or convert PDFs to Word, Excel, PowerPoint, images, and other formats. Experience lightning-fast merging, splitting, and compression.",
            "applicationCategory": "EducationalApplication, BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "PDF Conversion",
              "PDF Merging",
              "PDF Splitting",
              "Electronic Signatures",
              "OCR Text Scanning",
              "PDF Compression"
            ]
          })
        }}
      />
      <SiteHeader />

      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[10000px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px]"
          style={{ left: mouseX, top: mouseY, translateX: '-50%', translateY: '-50%' }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50"></div>
      </div>

      <main className="relative z-10">
        
        {/* HERO SECTION - Clean, Powerful, and Easy to Use */}
        <section className="px-6 relative pt-44 pb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-4xl"
          >
            {/* Simple Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Forever • Simple & Private</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1]">
              The Easiest Way to <br />
              <span className="text-indigo-500">Manage Your PDFs</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transform any file into a high-quality PDF or convert PDFs to Word, Excel, PowerPoint, images, and other formats. 
              Experience lightning-fast conversion, merging, splitting, and more—all processed <span className="text-white">securely in your browser.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <Link href="/convert" className="w-full sm:w-auto">
                <Button size="lg" className="h-16 w-full sm:w-[220px] rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-lg shadow-2xl shadow-indigo-500/20 group">
                  Start Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16 w-full sm:w-[220px] rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm"
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View All Tools
              </Button>
            </div>
          </motion.div>
        </section>

        {/* STATS SECTION - High trust indicators */}
        <section className="px-6 py-20 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                    { label: "Daily Files", value: "1.2M+", icon: FileText },
                    { label: "Active Users", value: "500K+", icon: Users },
                    { label: "Success Rate", value: "99.9%", icon: BarChart },
                    { label: "Time Saved/Day", value: "10K hrs", icon: Clock },
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-center mb-4">
                            <stat.icon size={24} className="text-indigo-400 opacity-50" />
                        </div>
                        <h4 className="text-3xl md:text-4xl font-black text-white">{stat.value}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* THE "WHY" SECTION - More Attractive Text */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
            <div className="text-center space-y-6 mb-24">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">WHY PEOPLE LOVE DOCORIO</h2>
                <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
                   We believe document management should be beautiful, effortless, and, above all, 
                   <span className="text-indigo-400 font-bold"> completely private.</span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { title: "No Data Leaving", desc: "Unlike other tools, we process your files locally. Your sensitive data stays within your browser's memory.", icon: Shield, color: "from-blue-500 to-indigo-500" },
                    { title: "Blazing Speed", desc: "Our engine is built for performance. Combine 100+ PDFs or scan large images in literal milliseconds.", icon: Zap, color: "from-indigo-500 to-purple-500" },
                    { title: "Browser Native", desc: "No software to install. No extensions. Just open the site and start working on any device.", icon: Laptop, color: "from-purple-500 to-pink-500" },
                    { title: "Pro Accuracy", desc: "Our AI OCR and conversion engines preserve your original formatting with surgical precision.", icon: Star, color: "from-pink-500 to-rose-500" },
                ].map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="group relative p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-indigo-500/40 transition-all hover:bg-slate-900/70 overflow-hidden"
                   >
                       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br shadow-xl group-hover:rotate-6 transition-transform", item.color)}>
                           <item.icon className="text-white" size={28} />
                       </div>
                       <h3 className="text-2xl font-black italic mb-4">{item.title}</h3>
                       <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                   </motion.div>
                ))}
            </div>
        </section>

        {/* DETAILED PROCESS - "HOW IT WORKS" */}
        <section className="px-6 py-32 bg-indigo-500/5">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-20 items-center">
                    <div className="flex-1 space-y-10">
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">THREE STEPS <br /> TO PERFECTION</h2>
                        <div className="space-y-12">
                            {[
                                { step: "01", title: "Select Your Tool", desc: "Pick from our suite of 10+ professional PDF and image management tools." },
                                { step: "02", title: "Upload & Edit", desc: "Drop your files into the workspace. Everything is processed instantly using your local hardware." },
                                { step: "03", title: "Download & Relax", desc: "Get your perfectly modified file back. Your data is automatically cleared from memory." },
                            ].map((s, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <span className="text-5xl font-black text-indigo-500/20 group-hover:text-indigo-500 transition-colors uppercase">{s.step}</span>
                                    <div>
                                        <h4 className="text-2xl font-bold mb-2">{s.title}</h4>
                                         <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative w-full aspect-square bg-slate-900 border border-white/5 rounded-[4rem] flex items-center justify-center overflow-hidden shadow-2xl">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                         <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-2/3 h-2/3 border border-white/5 rounded-full flex items-center justify-center">
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="w-2/3 h-2/3 border border-indigo-500/10 rounded-full flex items-center justify-center">
                                <Rocket size={64} className="text-indigo-400 animate-bounce" />
                            </motion.div>
                         </motion.div>
                    </div>
                </div>
            </div>
        </section>

        {/* WORKFLOW SHOWCASE - More Detailed Text */}
        <div className="space-y-40 py-40">
           <DetailedFeature 
              title="SMART TEXT SCANING" 
              description="Turn photos of paper into digital text you can edit. Our tool reads blurry photos and complex pages quickly and correctly. It works with many languages too."
              icon={Scan}
              link="/scanner"
              align="right"
           >
              <OCRMockup />
           </DetailedFeature>

           <DetailedFeature 
              title="SIGN ANY PDF" 
              description="Sign your documents without printing them. Just draw your signature on the screen and place it anywhere on the page. It's safe and stays on your computer."
              icon={Signature}
              link="/sign"
              align="left"
           >
              <SignMockup />
           </DetailedFeature>
        </div>

        {/* THE TOOLS GRID - Easy to use look */}
        <section className="px-6 py-40 max-w-7xl mx-auto">
           <div className="text-center mb-24 space-y-6">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-400 to-slate-700">OUR TOOLS</h2>
               <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">A collection of easy-to-use tools for your daily document work.</p>
           </div>

            <div id="tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                 {[
                     { name: "Convert Files", icon: Shuffle, link: "/convert", desc: "Change your files between PDF, Word, Excel, PPT, and Images while keeping them perfect.", color: "text-blue-400" },
                     { name: "Organize Pages", icon: Layout, link: "/organize", desc: "Reorder, delete, or rotate pages in your PDF with ease.", color: "text-indigo-400" },
                     { name: "PDF to Excel", icon: Table, link: "/pdf-to-excel", desc: "Turn your PDF documents into editable Excel spreadsheets.", color: "text-emerald-400" },
                     { name: "PDF to PPT", icon: Presentation, link: "/pdf-to-pptx", desc: "Convert your PDF pages into dynamic PowerPoint presentations.", color: "text-orange-400" },
                     { name: "PDF to JPG", icon: FileImage, link: "/pdf-to-jpg", desc: "Extract every page into high-quality JPG image files.", color: "text-rose-400" },
                     { name: "Text Scanner", icon: Scan, link: "/scanner", desc: "AI OCR to extract text from images and scanned documents.", color: "text-pink-400" },
                     { name: "Sign PDF", icon: Signature, link: "/sign", desc: "Draw your signature and place it anywhere on any page.", color: "text-amber-400" },
                     { name: "Protect PDF", icon: Lock, link: "/protect", desc: "Secure your documents with military-grade password encryption.", color: "text-emerald-400" },
                     { name: "Combine PDFs", icon: Layers, link: "/merge", desc: "Merge many PDF files into one document with easy drag-and-drop.", color: "text-violet-400" },
                     { name: "Split PDF", icon: Scissors, link: "/split", desc: "Separate one page or a whole set into independent PDF files easily.", color: "text-cyan-400" },
                     { name: "Make Smaller", icon: Zap, link: "/compress", desc: "Shrink your files for email without losing any visible quality.", color: "text-indigo-400" },
                     { name: "Resize PDF", icon: Maximize, link: "/resize", desc: "Change page dimensions to A4, Letter, or custom sizes.", color: "text-purple-400" },
                     { name: "Add Watermark", icon: Shield, link: "/watermark", desc: "Protect your work with custom text or image stamps.", color: "text-red-400" },
                     { name: "QR Generator", icon: QrCode, link: "/qrcode", desc: "Make clean QR codes for text, links, or business cards.", color: "text-green-400" },
                     { name: "Edit PDF", icon: PenTool, link: "/edit", desc: "Add text, shapes, and annotations directly to your PDF.", color: "text-blue-500" },
                     { name: "Fix Passwords", icon: Unlock, link: "/unlock", desc: "Remove passwords and limits from your PDF files safely.", color: "text-orange-400" },
                     { name: "Add Numbers", icon: Hash, link: "/page-numbers", desc: "Automatically add page numbers to your entire document.", color: "text-blue-300" },
                     { name: "Metadata Editor", icon: Tag, link: "/metadata", desc: "Modify hidden properties and file descriptors for better data management.", color: "text-teal-400" },
                     { name: "Flatten PDF", icon: Hammer, link: "/flatten", desc: "Make forms non-editable and merge annotations permanently.", color: "text-rose-500" },
                     { name: "Redact PDF", icon: Eraser, link: "/redact", desc: "Permanently black out sensitive data and private information.", color: "text-rose-600" },
                     { name: "Repair PDF", icon: Wrench, link: "/repair", desc: "Fix corridors and broken PDF files that won't open correctly.", color: "text-indigo-400" },
                     { name: "HTML to PDF", icon: Globe, link: "/html-to-pdf", desc: "Convert any public URL or webpage into a high-quality PDF.", color: "text-cyan-400" },
                     { name: "Images to PDF", icon: ImageIcon, link: "/image-to-pdf", desc: "Turn your photos and screenshots into a clean PDF file.", color: "text-emerald-500" },
                 ].map((tool, i) => (
                    <motion.div
                        key={tool.name}
                        whileHover={{ y: -5, scale: 1.01 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="h-full"
                    >
                        <Link 
                            href={tool.link}
                            className="p-8 sm:p-12 bg-slate-900 border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all block h-full group relative overflow-hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <div className={cn("p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] bg-slate-950 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500", tool.color)}>
                                    <tool.icon size={28} className="sm:w-8 sm:h-8" />
                                </div>
                                <div className="p-2 sm:p-3 rounded-full bg-white/5 text-slate-700 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 group-hover:text-white transition-colors">{tool.name}</h3>
                            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium transition-colors group-hover:text-slate-300">{tool.desc}</p>
                            
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500/0 group-hover:via-indigo-500/40 to-transparent transition-all duration-1000"></div>
                        </Link>
                    </motion.div>
                 ))}
            </div>
        </section>

        {/* FINAL IMPACT CTA */}
        <section className="px-6 py-60 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-600/5 blur-[150px] pointer-events-none"></div>
             <div className="max-w-4xl mx-auto space-y-12 relative">
                 <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic leading-none animate-pulse">START <br /> DOCORIO</h2>
                 <p className="text-slate-400 text-2xl max-w-2xl mx-auto font-medium">Join the next generation of document management today. Free, fast, and secure.</p>
                 <Link href="/convert">
                    <Button size="lg" className="rounded-full px-20 h-24 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-3xl shadow-[0_40px_100px_rgba(79,70,229,0.4)] transition-all">
                        GET STARTED NOW
                    </Button>
                 </Link>
             </div>
        </section>
      </main>

      <footer className="px-6 pt-32 pb-16 border-t border-white/5 bg-[#01040f] relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
              <div className="space-y-8">
                   <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <Layers size={24} />
                        </div>
                        <span className="text-white font-black text-3xl tracking-tighter uppercase">DOCORIO</span>
                   </div>
                   <p className="text-slate-400 text-lg leading-relaxed">
                       Making document tools easy, fast, and private for everyone. No complicated software, just your browser.
                   </p>
              </div>

              <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">Top Tools</h4>
                  <ul className="space-y-4 text-slate-400 text-lg">
                      <li><Link href="/merge" className="hover:text-indigo-400 transition-colors">Merge PDF</Link></li>
                      <li><Link href="/convert" className="hover:text-indigo-400 transition-colors">Convert Files</Link></li>
                      <li><Link href="/sign" className="hover:text-indigo-400 transition-colors">Sign PDF</Link></li>
                      <li><Link href="/compress" className="hover:text-indigo-400 transition-colors">Compress Size</Link></li>
                  </ul>
              </div>

              <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">Privacy</h4>
                  <ul className="space-y-4 text-slate-400 text-lg">
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Info</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
                  </ul>
              </div>

              <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">Company</h4>
                  <ul className="space-y-4 text-slate-400 text-lg">
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">API Access</a></li>
                      <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
             <p>© 2026 Docorio Global. All rights reserved.</p>
             <div className="flex gap-8">
                 <Link href="/merge" className="hover:text-white">Merge</Link>
                 <Link href="/split" className="hover:text-white">Split</Link>
                 <Link href="/convert" className="hover:text-white">Convert</Link>
             </div>
          </div>
      </footer>
    </div>
  )
}

function DetailedFeature({ title, description, icon: Icon, link, children, align = "left" }: { 
  title: string, 
  description: string, 
  icon: any, 
  link: string, 
  children: ReactNode, 
  align?: "left" | "right" 
}) {
    return (
        <section className="px-6 max-w-7xl mx-auto">
            <div className={cn(
                "flex flex-col gap-20 lg:gap-32 items-center",
                align === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
            )}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex-1 w-full bg-slate-900 border border-white/5 rounded-[4rem] overflow-hidden aspect-square relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    {children}
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: align === "left" ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex-1 space-y-10"
                >
                    <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl">
                        <Icon size={32} />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9]">{title}</h2>
                    <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
                        {description}
                    </p>
                    <Link href={link}>
                        <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-white text-black hover:bg-slate-200 font-black text-xl shadow-2xl">
                            TRY IT NOW
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

function OCRMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="w-full h-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-[12px] border-slate-950">
                <div className="h-16 bg-slate-100 flex items-center px-8 gap-3 border-b border-slate-200">
                    <div className="w-4 h-4 rounded-full bg-slate-300" />
                    <div className="w-4 h-4 rounded-full bg-slate-300" />
                </div>
                <div className="p-12 space-y-8 flex-1">
                    <div className="h-5 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-5 bg-slate-200 rounded-lg w-full" />
                    <div className="h-40 border-4 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex items-center justify-center relative shadow-inner">
                         <motion.div 
                           className="absolute top-0 left-0 w-full h-2 bg-indigo-500 shadow-[0_0_30px_#6366f1]"
                           animate={{ top: ['0%', '100%', '0%'] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                         />
                         <ImageIcon className="text-slate-300" size={64} />
                    </div>
                    <div className="space-y-4">
                        <div className="h-3 bg-indigo-100 rounded-lg w-full" />
                        <div className="h-3 bg-indigo-100 rounded-lg w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function SignMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="w-full h-full max-w-xl bg-white rounded-[4rem] shadow-2xl p-16 flex flex-col justify-end border-[12px] border-slate-950 relative overflow-hidden">
                <div className="absolute top-12 left-12 space-y-4 w-1/2">
                    <div className="h-4 bg-slate-100 rounded-lg w-full" />
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                </div>
                <div className="h-48 border-b-4 border-slate-200 relative">
                    <motion.svg className="absolute inset-0 w-full h-full text-indigo-600" viewBox="0 0 100 50">
                        <motion.path
                            d="M10,25 C20,10 40,40 50,25 C60,10 80,40 90,25"
                            stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </motion.svg>
                    <div className="absolute bottom-6 left-0 text-[10px] font-black text-slate-300 tracking-[0.5em] uppercase">Security Verified</div>
                </div>
            </div>
        </div>
    )
}
