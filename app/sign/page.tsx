import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Sign PDF Online | Electronic Signature for Documents",
  description: "Sign PDF documents online for free. Draw your e-signature and place it anywhere on your PDF. Fast, secure and legal.",
}

const SignClient = dynamic(() => import("./sign-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
    </div>
  )
})

export default function SignPage() {
  return <SignClient />
}
