"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, User, ArrowRight, Tag } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 selection:text-white">
      <SiteHeader />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Docorio</span> Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Expert tips, tutorials, and insights on mastering your digital documents.
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full flex flex-col bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                                    <Tag size={12} className="text-purple-400" /> {post.category}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-purple-400 transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                                {post.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                        {post.author[0]}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{post.author}</span>
                                </div>
                                <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={20} />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
