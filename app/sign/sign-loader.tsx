"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const SignClient = dynamic(() => import("./sign-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
    </div>
  )
})

export default function SignLoader() {
  return <SignClient />
}
