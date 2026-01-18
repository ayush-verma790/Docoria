"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  FileText, ArrowRight, Sparkles, Shield, 
  Layers, Image as ImageIcon, Scissors, 
  PenTool, Scan, Signature, RefreshCw,
  Table, Presentation, MessageSquare, 
  Zap, Lock, Smartphone, Globe, ChevronRight,
  CheckCircle2, Star, EyeOff, Wrench,
  User, Crop, CreditCard, Type, Aperture, Eraser, Palette, Camera, GitCompare
} from "lucide-react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Mouse tracking for dynamic effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth mouse movement for background elements
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  // Staggered Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 50 } 
    }
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-purple-500/30 selection:text-purple-900 dark:selection:text-white transition-colors duration-300"
      onMouseMove={handleMouseMove}
    >

      {/* RICH ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Deep Cosmos Gradient for Dark, Airy Blue for Light */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-background to-background dark:from-indigo-900/20 dark:via-[#030014] dark:to-[#030014]" />
         
         {/* Moving Auroras */}
         <motion.div 
            style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
            className="absolute top-1/4 left-1/4 w-[1000px] h-[1000px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50"
         />
         <motion.div 
            style={{ x: smoothY, y: smoothX, translateX: '-50%', translateY: '-50%' }}
            className="absolute top-3/4 right-1/4 w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50"
         />

         {/* Starfield / Noise */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.07] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* HERO SECTION - The "Wow" Factor */}
        <section className="px-6 flex flex-col items-center text-center mb-32 relative">
          
          {/* Glowing Orb Behind Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full -z-10"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 max-w-5xl z-10"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-300 tracking-wide uppercase shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>Version 2.0 Now Live</span>
            </motion.div>
            
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.9] text-foreground drop-shadow-2xl">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 animate-gradient-fast">
                Digital Docs
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Transform, merge, and edit PDFs with <span className="text-foreground font-semibold">unmatched speed</span>. 
              Secure, local, and beautifully designed for pros.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
              <Link href="/convert" className="w-full sm:w-auto">
                <Button size="lg" className="h-16 px-10 w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/25 border border-white/10 hover:scale-105 transition-all duration-300">
                  Get Started for Free
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16 px-8 w-full sm:w-auto rounded-full border-border bg-background/50 hover:bg-muted text-foreground font-semibold text-lg hover:scale-105 transition-all duration-300 backdrop-blur-md"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Features
              </Button>
            </div>
          </motion.div>
          
          {/* 3D Dashboard Preview - The "Product Shot" */}
          <motion.div 
             initial={{ opacity: 0, y: 100, rotateX: 20 }}
             animate={{ opacity: 1, y: 0, rotateX: 0 }}
             transition={{ delay: 0.4, duration: 1, type: "spring" }}
             className="mt-24 w-full max-w-6xl relative perspective-[2000px] group"
          >
             {/* Floating Elements */}
             <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 hidden lg:block animate-float">
                <div className="glass p-4 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-white">File Converted</div>
                         <div className="text-xs text-gray-400">report_final.pdf</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="absolute -right-10 top-1/4 z-20 hidden lg:block animate-float-delayed">
                <div className="glass p-4 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                         <Star size={20} fill="currentColor" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-white">Pro Features</div>
                         <div className="text-xs text-gray-400">Activated</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Main Card */}
             <div className="relative rounded-3xl overflow-hidden glass border border-white/10 shadow-[0_0_100px_rgba(124,58,237,0.15)] bg-[#0A0A0F]/80 backdrop-blur-2xl ring-1 ring-white/10 transform transition-transform duration-700 hover:scale-[1.01]">
                {/* Window Controls */}
                <div className="absolute top-0 left-0 right-0 h-14 bg-white/5 border-b border-white/5 flex items-center px-6 gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                   <div className="ml-6 flex-1 flex justify-center">
                      <div className="px-4 py-1.5 rounded-lg bg-black/40 text-xs text-gray-500 font-mono border border-white/5 flex items-center gap-2">
                         <Lock size={10} /> docorio.com
                      </div>
                   </div>
                </div>
                
                {/* Content */}
                <div className="pt-20 pb-10 px-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureHighlight 
                       icon={RefreshCw} 
                       title="Universal Convert" 
                       desc="Any format to PDF and back in milliseconds." 
                       color="text-cyan-400" 
                       bg="bg-cyan-400/10" 
                       border="border-cyan-400/20"
                    />
                    <FeatureHighlight 
                       icon={MessageSquare} 
                       title="AI Chat" 
                       desc="Talk to your documents. Extract insights instantly." 
                       color="text-purple-400" 
                       bg="bg-purple-400/10" 
                       border="border-purple-400/20"
                    />
                    <FeatureHighlight 
                       icon={Signature} 
                       title="eSign Securely" 
                       desc="Legally binding signatures with audit trails." 
                       color="text-pink-400" 
                       bg="bg-pink-400/10" 
                       border="border-pink-400/20"
                    />
                </div>
                
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
             </div>
          </motion.div>
        </section>

        {/* STATS STRIP - Clean & Modern */}
        <section className="border-y border-border/50 bg-muted/30 dark:bg-white/[0.02] backdrop-blur-sm mb-32">
             <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap justify-between items-center gap-8">
                {[
                  { value: "10M+", label: "Files Processed", icon: FileText },
                  { value: "0s", label: "Wait Time", icon: Zap },
                  { value: "256-bit", label: "Encryption", icon: Shield },
                  { value: "100%", label: "Free Forever", icon: Star }
                ].map((stat, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-background dark:bg-white/5 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors shadow-sm">
                         <stat.icon size={24} />
                      </div>
                      <div>
                         <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                         <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                      </div>
                   </div>
                ))}
             </div>
        </section>

        {/* BENTO GRID FEATURES - The "Candy Store" */}
        <section id="features" className="px-6 py-20 max-w-7xl mx-auto">
           <div className="text-center mb-24 space-y-6">
             <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">Everything</span> you need.
             </h2>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               A power-packed suite of tools designed for speed, privacy, and ease of use.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[300px]">
              {/* Large Feature 1 */}
              <BentoCard 
                 colSpan="md:col-span-3 lg:col-span-8"
                 title="Conversion Studio"
                 desc="Transform PDFs into editable Word, Excel, and PowerPoint files with high fidelity. Supports batch processing."
                 icon={RefreshCw}
                 href="/convert"
                 gradient="from-cyan-500/20 via-blue-500/10 to-transparent"
                 accent="text-cyan-500 dark:text-cyan-400"
              />
              {/* Feature 2 */}
              <BentoCard 
                 colSpan="md:col-span-3 lg:col-span-4"
                 title="AI Assistant"
                 desc="Chat with your PDF. Summarize long documents."
                 icon={MessageSquare}
                 href="/chat-pdf"
                 gradient="from-purple-500/20 to-pink-500/5"
                 accent="text-purple-500 dark:text-purple-400"
              />
              {/* Feature 3 */}
              <BentoCard 
                 colSpan="md:col-span-2 lg:col-span-4"
                 title="Scanner & OCR"
                 desc="Turn paper into digital text instantly."
                 icon={Scan}
                 href="/scanner"
                 gradient="from-emerald-500/20 to-teal-500/5"
                 accent="text-emerald-500 dark:text-emerald-400"
              />
              {/* Feature 4 */}
              <BentoCard 
                 colSpan="md:col-span-2 lg:col-span-4" 
                 title="Secure Storage"
                 desc="Military-grade encryption for your files."
                 icon={Lock}
                 href="/protect"
                 gradient="from-orange-500/20 to-red-500/5"
                 accent="text-orange-500 dark:text-orange-400"
              />
              {/* Feature 5 */}
              <BentoCard 
                 colSpan="md:col-span-2 lg:col-span-4"
                 title="PDF Editor"
                 desc="Resize, merge, split and watermark."
                 icon={Layers}
                 href="/edit"
                 gradient="from-indigo-500/20 to-violet-500/5"
                 accent="text-indigo-500 dark:text-indigo-400"
              />
           </div>
        </section>

        {/* COMPLETE TOOL DIRECTORY */}
        <section className="px-6 py-32 relative bg-secondary/30 dark:bg-black/20 border-t border-border/50">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                
                <div className="text-center space-y-4">
                     <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">The Complete Suite</h2>
                     <p className="text-muted-foreground max-w-2xl mx-auto">Every tool you need to manage your documents, available for free.</p>
                </div>

                <div className="grid gap-12">
                    
                    {/* Category: Conversion */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                                <RefreshCw className="w-6 h-6" /> 
                             </div>
                             <h3 className="text-2xl font-bold text-foreground tracking-tight">Conversion Tools</h3>
                        </div>
                        
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        >
                            {[
                                { name: "PDF to Word", href: "/convert?to=word", icon: FileText, desc: "Convert PDF to editable Docx" },
                                { name: "PDF to Excel", href: "/convert?to=excel", icon: Table, desc: "Extract tables from PDF" },
                                { name: "PDF to PPT", href: "/convert?to=ppt", icon: Presentation, desc: "Turn PDF into slides" },
                                { name: "PDF to JPG", href: "/convert?to=jpg", icon: ImageIcon, desc: "Save pages as images" },
                                { name: "Word to PDF", href: "/convert?from=word", icon: FileText, desc: "Docx to PDF document" },
                                { name: "Excel to PDF", href: "/convert?from=excel", icon: Table, desc: "Spreadsheet to PDF" },
                                { name: "PPT to PDF", href: "/convert?from=ppt", icon: Presentation, desc: "Slides to PDF" },
                                { name: "JPG to PDF", href: "/image-to-pdf", icon: ImageIcon, desc: "Images to single PDF" },
                                { name: "HTML to PDF", href: "/html-to-pdf", icon: Globe, desc: "Webpages to PDF" },
                            ].map((tool) => (
                                <motion.div key={tool.name} variants={itemVariants}>
                                <Link href={tool.href} className="group relative flex flex-col p-6 h-56 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] hover:border-indigo-500/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="mb-auto flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm relative z-10">
                                            <tool.icon size={26} strokeWidth={1.5} />
                                        </div>
                                        <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                             <ArrowRight size={20} className="text-indigo-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mt-6">
                                        <h4 className="font-exchanged text-xl font-bold text-foreground mb-2 group-hover:text-indigo-400 transition-colors tracking-tight">{tool.name}</h4>
                                        <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors font-medium leading-relaxed">{tool.desc}</p>
                                    </div>
                                </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Category: Modification & Organization */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                                <Layers className="w-6 h-6" /> 
                             </div>
                             <h3 className="text-2xl font-bold text-foreground tracking-tight">Modification & Organization</h3>
                        </div>

                        <motion.div 
                             variants={containerVariants}
                             initial="hidden"
                             whileInView="visible"
                             viewport={{ once: true, margin: "-100px" }}
                             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        >
                            {[
                                { name: "Merge PDF", href: "/merge", icon: Layers, desc: "Combine multiple files" },
                                { name: "Compare PDF", href: "/compare", icon: GitCompare, desc: "Visualize differences" },
                                { name: "Split PDF", href: "/split", icon: Scissors, desc: "Extract specific pages" },
                                { name: "Auto Split", href: "/auto-split", icon: Zap, desc: "Split by text or size" },
                                { name: "Extract Images", href: "/extract-images", icon: ImageIcon, desc: "Get photos from PDF" },
                                { name: "PDF to Text", href: "/pdf-to-text", icon: FileText, desc: "Convert PDF to TXT" },
                                { name: "Compress PDF", href: "/compress", icon: Zap, desc: "Reduce file size" },
                                { name: "Organize", href: "/organize", icon: Layers, desc: "Sort & delete pages" },
                                { name: "Rotate PDF", href: "/rotate", icon: RefreshCw, desc: "Fix page orientation" },
                                { name: "Page Numbers", href: "/page-numbers", icon: FileText, desc: "Add numbering to pages" },
                                { name: "Resize PDF", href: "/resize", icon: Scan, desc: "Change page dimensions" },
                                { name: "Repair PDF", href: "/repair", icon:  Wrench, desc: "Fix corrupted files" },
                                { name: "Flatten PDF", href: "/flatten", icon: Layers, desc: "Lock form fields" },
                                { name: "Watermark PDF", href: "/watermark", icon: CheckCircle2, desc: "Add stamp or text" },
                                { name: "Crop PDF", href: "/crop", icon: Crop, desc: "Trim page margins" },
                            ].map((tool) => (
                                <motion.div key={tool.name} variants={itemVariants}>
                                <Link href={tool.href} className="group relative flex flex-col p-6 h-56 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)] hover:border-cyan-500/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="mb-auto flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm relative z-10">
                                            <tool.icon size={26} strokeWidth={1.5} />
                                        </div>
                                        <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                             <ArrowRight size={20} className="text-cyan-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mt-6">
                                        <h4 className="font-exchanged text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors tracking-tight">{tool.name}</h4>
                                        <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors font-medium leading-relaxed">{tool.desc}</p>
                                    </div>
                                </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Category: Security & AI */}
                    <div className="space-y-8">
                         <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-500/20">
                                <Shield className="w-6 h-6" /> 
                             </div>
                             <h3 className="text-2xl font-bold text-foreground tracking-tight">Security & AI Tools</h3>
                        </div>

                        <motion.div 
                             variants={containerVariants}
                             initial="hidden"
                             whileInView="visible"
                             viewport={{ once: true, margin: "-100px" }}
                             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        >
                            {[
                                { name: "Chat PDF", href: "/chat-pdf", icon: MessageSquare, desc: "AI Powered Assistant" },
                                { name: "Summarizer", href: "/summarizer", icon: Sparkles, desc: "Get quick insights" },
                                { name: "eSign PDF", href: "/sign", icon: Signature, desc: "Digital signatures" },
                                { name: "Protect PDF", href: "/protect", icon: Lock, desc: "Encrypt with password" },
                                { name: "Unlock PDF", href: "/unlock", icon: Lock, desc: "Remove passwords" },
                                { name: "Redact PDF", href: "/redact", icon: EyeOff, desc: "Blackout sensitive info" },
                                { name: "Edit Metadata", href: "/metadata", icon: FileText, desc: "Change file properties" },
                                { name: "Scanner", href: "/scanner", icon: Smartphone, desc: "Scan physical docs" },
                                { name: "QR Code", href: "/qrcode", icon: Scan, desc: "Generate codes" },
                            ].map((tool) => (
                                <motion.div key={tool.name} variants={itemVariants}>
                                <Link href={tool.href} className="group relative flex flex-col p-6 h-56 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:border-purple-500/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="mb-auto flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm relative z-10">
                                            <tool.icon size={26} strokeWidth={1.5} />
                                        </div>
                                        <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                             <ArrowRight size={20} className="text-purple-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mt-6">
                                        <h4 className="font-exchanged text-xl font-bold text-foreground mb-2 group-hover:text-purple-400 transition-colors tracking-tight">{tool.name}</h4>
                                        <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors font-medium leading-relaxed">{tool.desc}</p>
                                    </div>
                                </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Category: Image Studio (New) */}
                    <div className="space-y-8">
                         <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 dark:text-pink-400 border border-pink-500/20">
                                <Palette className="w-6 h-6" /> 
                             </div>
                             <h3 className="text-2xl font-bold text-foreground tracking-tight">Image Studio</h3>
                        </div>

                        <motion.div 
                             variants={containerVariants}
                             initial="hidden"
                             whileInView="visible"
                             viewport={{ once: true, margin: "-100px" }}
                             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        >
                            {[
                                { name: "Remove BG", href: "/image-tools/bg-remover", icon: Eraser, desc: "Remove backgrounds instantly" },
                                { name: "Passport Photo", href: "/image-tools/passport", icon: User, desc: "Create mostly compliant IDs" },
                                { name: "Resize Image", href: "/image-tools/resize", icon: ImageIcon, desc: "Change dimensions & scale" },
                                { name: "Compress Image", href: "/compress?type=image", icon: Zap, desc: "Reduce file size heavily" },
                                { name: "Profile Maker", href: "/image-tools/profile", icon: Camera, desc: "Perfect circle avatars" },
                                { name: "Crop Image", href: "/image-tools/crop", icon: Crop, desc: "Trim edges and focus" },
                                { name: "Signature", href: "/sign", icon: PenTool, desc: "Create digital signatures" },
                                { name: "ID Card Maker", href: "/image-tools/id-card", icon: CreditCard, desc: "Design simple ID cards" },
                                { name: "Watermark", href: "/watermark?type=image", icon: Aperture, desc: "Protect your photos" },
                                { name: "Image to Text", href: "/scanner", icon: Type, desc: "Extract text from images" },
                                { name: "Blur Image", href: "/image-tools/blur", icon: Palette, desc: "Blur sensitive details" },
                                { name: "Convert Format", href: "/convert", icon: RefreshCw, desc: "JPG, PNG, WEBP, AVIF" },
                            ].map((tool) => (
                                <motion.div key={tool.name} variants={itemVariants}>
                                <Link href={tool.href} className="group relative flex flex-col p-6 h-56 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)] hover:border-pink-500/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="mb-auto flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm relative z-10">
                                            <tool.icon size={26} strokeWidth={1.5} />
                                        </div>
                                        <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                             <ArrowRight size={20} className="text-pink-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mt-6">
                                        <h4 className="font-exchanged text-xl font-bold text-foreground mb-2 group-hover:text-pink-400 transition-colors tracking-tight">{tool.name}</h4>
                                        <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors font-medium leading-relaxed">{tool.desc}</p>
                                    </div>
                                </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>

        {/* CTA SECTION - Vibrant and Bold */}
        <section className="px-6 py-40">
           <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden border border-white/20 bg-gradient-to-b from-purple-900/40 to-black/40 backdrop-blur-xl p-12 md:p-24 text-center">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
               {/* Glowing Blobs */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

               <div className="relative z-10 space-y-8">
                   <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                       Ready to go <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pro?</span>
                   </h2>
                   <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                       Just kidding. It's free forever. Start managing your documents like a master today.
                   </p>
                   <Link href="/convert">
                       <Button className="h-20 px-12 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-xl shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-300">
                           Launch Docorio <ArrowRight className="ml-2 w-6 h-6" />
                       </Button>
                   </Link>
               </div>
           </div>
        </section>

        {/* FAQ SECTION - SEO Goldmine */}
        <section className="px-6 py-32 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                 <h2 className="text-4xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
                 <p className="text-muted-foreground text-lg">Common questions about our free PDF tools.</p>
            </div>
            
            <div className="grid gap-6">
                {[
                    { q: "Is Docorio completely free?", a: "Yes, Docorio is 100% free to use. You can merge, split, compress, and edit PDFs without paying a dime." },
                    { q: "Are my files secure?", a: "Absolutely. We use detailed client-side processing, meaning your files often never leave your browser. If they do, they are encrypted and deleted instantly." },
                    { q: "Do I need to install any software?", a: "No. All tools run directly in your web browser. You can use Docorio on Windows, Mac, Linux, iPhone, and Android." },
                    { q: "How can I merge multiple PDFs?", a: "Simply upload your files to our Merge PDF tool, drag to reorder them, and click 'Merge'. It takes seconds." },
                    { q: "Can I edit text in a PDF?", a: "Yes! Use our Edit PDF tool to add text, images, signatures, and shapes to any document." }
                ].map((faq, i) => (
                    <article key={i} className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-colors">
                        <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                             <span className="text-primary">Q.</span> {faq.q}
                        </h3>
                         <p className="text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                    </article>
                ))}
            </div>
            
            {/* FAQ JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            { q: "Is Docorio completely free?", a: "Yes, Docorio is 100% free to use. You can merge, split, compress, and edit PDFs without paying a dime." },
                            { q: "Are my files secure?", a: "Absolutely. We use detailed client-side processing, meaning your files often never leave your browser. If they do, they are encrypted and deleted instantly." },
                            { q: "Do I need to install any software?", a: "No. All tools run directly in your web browser. You can use Docorio on Windows, Mac, Linux, iPhone, and Android." },
                            { q: "How can I merge multiple PDFs?", a: "Simply upload your files to our Merge PDF tool, drag to reorder them, and click 'Merge'. It takes seconds." },
                            { q: "Can I edit text in a PDF?", a: "Yes! Use our Edit PDF tool to add text, images, signatures, and shapes to any document." }
                        ].map(item => ({
                            "@type": "Question",
                            "name": item.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.a
                            }
                        }))
                    })
                }}
            />
        </section>

      </main>

      {/* MASSIVE FOOTER */}
      <footer className="relative border-t border-white/5 bg-[#02000d] pt-32 pb-12 overflow-hidden font-sans">
          
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-white/5 whitespace-nowrap select-none pointer-events-none z-0 tracking-tighter">
              DOCORIO
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 border-b border-white/5 pb-16">
                  
                  {/* Brand Column */}
                  <div className="md:col-span-5 space-y-8">
                      <Link href="/" className="inline-flex items-center gap-3 group">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                              <Layers size={24} strokeWidth={3} />
                          </div>
                          <span className="font-extrabold text-3xl tracking-tight text-white">Docorio</span>
                      </Link>
                      <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                          The world's most advanced open-source document platform. 
                          Built for speed, security, and design lovers.
                      </p>
                      
                      <div className="flex items-center gap-4">
                          {[
                              { label: "Twitter", href: "#", icon: Globe },
                              { label: "Github", href: "#", icon: Layers }, // Placeholder icon
                              { label: "Discord", href: "#", icon: MessageSquare }
                          ].map((social) => (
                              <Link 
                                  key={social.label} 
                                  href={social.href}
                                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
                              >
                                  <social.icon size={20} />
                              </Link>
                          ))}
                      </div>
                  </div>

                  {/* Newsletter Column */}
                  <div className="md:col-span-7 space-y-8">
                       <h3 className="text-3xl font-bold text-white">Stay updated with the latest features.</h3>
                       <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                           <input 
                              type="email" 
                              placeholder="Enter your email address" 
                              className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 outline-none text-white w-full transition-all"
                           />
                           <Button className="h-14 px-8 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-100 shrink-0">
                               Subscribe
                           </Button>
                       </div>
                  </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                  <div className="flex flex-col gap-6">
                      <h4 className="font-bold text-white text-lg">Product</h4>
                      <Link href="/convert" className="text-gray-500 hover:text-indigo-400 transition-colors">Converter</Link>
                      <Link href="/edit" className="text-gray-500 hover:text-indigo-400 transition-colors">Editor</Link>
                      <Link href="/compress" className="text-gray-500 hover:text-indigo-400 transition-colors">Compressor</Link>
                      <Link href="/chat-pdf" className="text-gray-500 hover:text-indigo-400 transition-colors">Chat AI</Link>
                  </div>
                  <div className="flex flex-col gap-6">
                      <h4 className="font-bold text-white text-lg">Tools</h4>
                      <Link href="/merge" className="text-gray-500 hover:text-indigo-400 transition-colors">Merge PDF</Link>
                      <Link href="/split" className="text-gray-500 hover:text-indigo-400 transition-colors">Split PDF</Link>
                      <Link href="/sign" className="text-gray-500 hover:text-indigo-400 transition-colors">eSign</Link>
                      <Link href="/scanner" className="text-gray-500 hover:text-indigo-400 transition-colors">Scanner</Link>
                  </div>
                  <div className="flex flex-col gap-6">
                      <h4 className="font-bold text-white text-lg">Resources</h4>
                      <Link href="/blog" className="text-gray-500 hover:text-indigo-400 transition-colors">Blog</Link>
                      <Link href="/faq" className="text-gray-500 hover:text-indigo-400 transition-colors">FAQ</Link>
                      <Link href="/api" className="text-gray-500 hover:text-indigo-400 transition-colors">API</Link>
                      <Link href="/pricing" className="text-gray-500 hover:text-indigo-400 transition-colors">Pricing</Link>
                  </div>
                  <div className="flex flex-col gap-6">
                      <h4 className="font-bold text-white text-lg">Company</h4>
                      <Link href="/about" className="text-gray-500 hover:text-indigo-400 transition-colors">About</Link>
                      <Link href="/careers" className="text-gray-500 hover:text-indigo-400 transition-colors">Careers</Link>
                      <Link href="/legal" className="text-gray-500 hover:text-indigo-400 transition-colors">Legal</Link>
                      <Link href="/contact" className="text-gray-500 hover:text-indigo-400 transition-colors">Contact</Link>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-gray-600 text-sm">
                  <p>© 2026 Docorio Inc. All rights reserved.</p>
                  <div className="flex gap-8 mt-4 md:mt-0">
                      <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                      <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  )
}

function FeatureHighlight({ icon: Icon, title, desc, color, bg, border }: any) {
    // Adaptive Color Mapping for Light/Dark Modes
    const colorMap: Record<string, string> = {
        "text-cyan-400": "text-cyan-600 dark:text-cyan-400",
        "text-purple-400": "text-purple-600 dark:text-purple-400",
        "text-pink-400": "text-pink-600 dark:text-pink-400",
    }
    const bgMap: Record<string, string> = {
        "bg-cyan-400/10": "bg-cyan-500/10 dark:bg-cyan-400/10",
        "bg-purple-400/10": "bg-purple-500/10 dark:bg-purple-400/10",
        "bg-pink-400/10": "bg-pink-500/10 dark:bg-pink-400/10",
    }
    const borderMap: Record<string, string> = {
        "border-cyan-400/20": "border-cyan-500/20 dark:border-cyan-400/20",
        "border-purple-400/20": "border-purple-500/20 dark:border-purple-400/20",
        "border-pink-400/20": "border-pink-500/20 dark:border-pink-400/20",
    }

    const adaptiveColor = colorMap[color] || color
    const adaptiveBg = bgMap[bg] || bg
    const adaptiveBorder = borderMap[border] || border

    // Lookup for gradient classes
    const gradients: Record<string, string> = {
        "text-cyan-400": "from-cyan-500",
        "text-purple-400": "from-purple-500",
        "text-pink-400": "from-pink-500",
    }
    const gradientFrom = gradients[color] || "from-purple-500"

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 hover:bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${gradientFrom} to-transparent`}></div>
            
            <div className="relative z-10 flex items-start gap-4">
                 <div className={cn("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm group-hover:rotate-6 transition-transform duration-300", adaptiveBg, adaptiveBorder, adaptiveColor)}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">{desc}</p>
                </div>
            </div>
        </div>
    )
}

function BentoCard({ colSpan, title, desc, icon: Icon, href, gradient, accent }: any) {
    return (
        <Link href={href} className={cn("group block relative overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-xl", colSpan)}>
            {/* Background Gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 dark:opacity-50 group-hover:opacity-80 dark:group-hover:opacity-100 transition-opacity duration-500", gradient)}></div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-background/50 border border-border/50 group-hover:scale-110 transition-transform duration-300 shadow-sm", accent)}>
                        <Icon size={28} />
                     </div>
                     <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:translate-x-2 transition-transform duration-300">{title}</h3>
                     <p className="text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">{desc}</p>
                </div>
                
                <div className="flex justify-end">
                    <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>
        </Link>
    )
}

