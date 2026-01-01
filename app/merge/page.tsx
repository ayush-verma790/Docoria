import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Merge PDF Files Online | Combine Multiple PDFs for Free",
  description: "Combine multiple PDF documents into a single file in seconds. Easy drag-and-drop interface, secure and private browser processing.",
}

const MergeClient = dynamic(() => import("./merge-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
    </div>
  )
})

export default function MergePage() {
  return <MergeClient />
}
