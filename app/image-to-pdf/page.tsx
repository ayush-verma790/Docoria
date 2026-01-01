"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ImageToPdfClient = dynamic(() => import("./image-to-pdf-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  )
})

export default function ImageToPdfPage() {
  return <ImageToPdfClient />
}
