"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { ArrowLeft } from "lucide-react"

const OrganizeClient = dynamic(() => import("./organize-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <div className="bg-white border-b py-4 px-8 flex items-center gap-4">
          <ArrowLeft className="text-gray-400" />
          <div className="h-6 w-32 bg-gray-100 animate-pulse rounded" />
       </div>
       <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
       </div>
    </div>
  )
})

export default function OrganizeLoader() {
  return <OrganizeClient />
}
