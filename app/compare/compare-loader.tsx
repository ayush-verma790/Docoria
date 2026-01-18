"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const CompareClient = dynamic(() => import("./compare-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  )
})

export default function CompareLoader() {
  return <CompareClient />
}
