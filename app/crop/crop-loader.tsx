"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const CropClient = dynamic(() => import("./crop-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  )
})

export default function CropLoader() {
  return <CropClient />
}
