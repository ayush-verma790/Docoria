"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ChatClient = dynamic(() => import("./chat-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
})

export default function ChatLoader() {
  return <ChatClient />
}
