"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
    Maximize, Zap, Layers, Crop, 
    CheckCircle2, Eraser, PenTool, Lock,
    ArrowRight, FileText, Download 
} from "lucide-react"
import { useRouter } from "next/navigation"
import { setGlobalFile } from "@/lib/file-store"
import { motion } from "framer-motion"

interface NextActionGridProps {
    file: File | null; // The result file to pass on
}

export function NextActionGrid({ file }: NextActionGridProps) {
    const router = useRouter()

    const handleNavigate = (path: string) => {
        if (file) {
            setGlobalFile(file, "previous-tool")
        }
        router.push(path)
    }

    if (!file) return null

    const tools = [
        { name: "Compress", icon: Zap, path: "/compress", desc: "Reduce file size" },
        { name: "Watermark", icon: CheckCircle2, path: "/watermark", desc: "Add logo/stamp" },
        { name: "Resize", icon: Maximize, path: "/resize", desc: "Change dimensions" },
        { name: "Protect", icon: Lock, path: "/protect", desc: "Add Password" },
        { name: "Organize", icon: Layers, path: "/organize", desc: "Sort pages" },
        { name: "PDF to Text", icon: FileText, path: "/pdf-to-text", desc: "Extract Content" },
    ]

    return (
        <div className="w-full space-y-6 mt-12 animate-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-white/10"></div>
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Do more with your file</span>
                 <div className="h-px flex-1 bg-white/10"></div>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                 {tools.map((tool) => (
                     <motion.button
                        key={tool.name}
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigate(tool.path)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group text-center min-h-[100px]"
                     >
                         <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 group-hover:bg-cyan-400/10 transition-colors">
                             <tool.icon size={16} />
                         </div>
                         <div className="space-y-0.5">
                             <div className="font-bold text-xs text-gray-200 leading-tight">{tool.name}</div>
                             <div className="text-[9px] text-gray-500 leading-tight line-clamp-2 max-w-[80px] mx-auto opacity-70 group-hover:opacity-100">{tool.desc}</div>
                         </div>
                     </motion.button>
                 ))}
             </div>
        </div>
    )
}
