import { Metadata } from 'next'
import ResizeClient from './resize-client'

export const metadata: Metadata = {
  title: "Resize PDF Online | Change PDF Page Dimensions",
  description: "Scale your PDF pages to standard sizes like A4, US Letter, or custom dimensions. Perfect for professional document formatting.",
}

export default function ResizePage() {
  return <ResizeClient />
}
