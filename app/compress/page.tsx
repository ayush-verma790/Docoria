import { Metadata } from 'next'
import CompressClient from './compress-client'

export const metadata: Metadata = {
  title: "Compress PDF Online | Reduce PDF Size for Free",
  description: "Shrink your PDF files without losing quality. Optimize documents for email, fast web loading, and storage efficiency.",
}

export default function CompressPage() {
  return <CompressClient />
}
