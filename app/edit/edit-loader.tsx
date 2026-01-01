"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const EditClient = dynamic(() => import("./edit-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  )
})

export default function EditLoader() {
  return <EditClient />
}
