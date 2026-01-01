"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ConvertClient = dynamic(() => import("./convert-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
})

export default function ConvertLoader({ initialFormat = "pdf" }: { initialFormat?: "pdf" | "docx" | "xlsx" | "pptx" | "png" | "jpg" | "webp" | "tiff" | "avif" | "gif" | "bmp" }) {
  return <ConvertClient initialFormat={initialFormat} />
}
