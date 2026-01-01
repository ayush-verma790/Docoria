import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Convert PDF to Word, Excel & PPT | Free Online Converter",
  description: "Transform your PDF documents into editable Word, Excel, and PowerPoint files instantly. High-quality conversion with formatting preserved.",
}

const ConvertClient = dynamic(() => import("./convert-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
    </div>
  )
})

export default function ConvertPage() {
  return <ConvertClient />
}
