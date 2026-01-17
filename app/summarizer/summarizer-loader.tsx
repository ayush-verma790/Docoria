"use client"

import dynamic from "next/dynamic"

const SummarizerClient = dynamic(() => import("./summarizer-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
    </div>
  )
})

export default function SummarizerLoader() {
  return <SummarizerClient />
}
