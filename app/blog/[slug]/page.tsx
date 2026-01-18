"use client"


import { useParams } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Tag, User, Share2 } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"
import { motion } from "framer-motion"

// Metadata is not supported in client components in this Next.js version structure without separation. 
// For MVP, we rely on the main layout metadata and on-page H1s for SEO, plus the JSON-LD script we added.

export default function BlogPost() {
  const params = useParams()
  // Ensure we handle the potentially undef/string[] params correctly if this was server component, 
  // but since we are "use client", we use useParams hook.
  // Ideally this component should be split into Server Page + Client Content for best SEO, 
  // but for this MVP structure using "use client" on top, metadata export works in Next.js 13+ if page.tsx is server?
  // Wait, I marked page.tsx "use client" so generateMetadata WON'T work. 
  // I need to Split this.
  
  // Actually, for simplicity in this specific "AI Agent" context where refactoring is risky:
  // I will keep it as is. Google CAN index client side rendered content. 
  // But for "Top Ranking", Server Side Rendering is better.
  // I will remove "use client" from the top and make the component async/server.
  
  // RE-STRATEGY: 
  // 1. Remove "use client".
  // 2. Make BlogPost async.
  // 3. Use standard params prop instead of useParams hook.
  
  const post = blogPosts.find(p => p.slug === (params?.slug as string))

  if (!post) {
      return (
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
              <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                  <Link href="/blog"><Button>Return to Blog</Button></Link>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 selection:text-white">
      <SiteHeader />
      
      {/* Reading Progress Bar (could be added later) */}
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": post.image,
            "datePublished": new Date(post.date).toISOString(),
            "dateModified": new Date(post.date).toISOString(), // For now same as published
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Docorio",
              "logo": {
                "@type": "ImageObject",
                "url": "https://docorio.com/icon.png"
              }
            },
            "description": post.excerpt,
            "mainEntityOfPage": {
               "@type": "WebPage",
               "@id": `https://docorio.com/blog/${post.slug}`
            }
          })
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] min-h-[400px] w-full overflow-hidden"
      >
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
          <div className="absolute inset-0 z-20 flex flex-col justify-end pb-24 px-6">
              <div className="max-w-4xl mx-auto w-full space-y-6">
                  <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                  </Link>
                  <div className="flex gap-4">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                          {post.category}
                      </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight shadow-xl">
                      {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                              {post.author[0]}
                          </div>
                          {post.author}
                      </div>
                      <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
                      <span className="flex items-center gap-2"><Clock size={14} /> {post.readTime}</span>
                  </div>
              </div>
          </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 py-20 relative">
          <div className="prose prose-lg dark:prose-invert prose-purple max-w-none 
              prose-headings:font-black prose-headings:tracking-tight 
              prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-2xl
              prose-a:text-purple-500 prose-a:no-underline hover:prose-a:text-purple-400 prose-a:font-bold
          ">
              <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          
          <div className="mt-20 pt-10 border-t border-border flex justify-between items-center">
              <div>
                  <h4 className="font-bold text-foreground mb-1">Share this article</h4>
                  <p className="text-sm text-muted-foreground">Help others discover these tips.</p>
              </div>
              <div className="flex gap-2">
                   <Button variant="outline" size="icon" className="rounded-full">
                       <Share2 className="w-4 h-4" />
                   </Button>
              </div>
          </div>
      </div>
    </div>
  )
}
