import { Metadata } from 'next'
import WatermarkLoader from './watermark-loader'

export const metadata: Metadata = {
  title: "Add Watermark to PDF | Secure Your Documents Online",
  description: "Protect your PDF files with text or image watermarks. Set custom opacity, position, and rotation for your stamps.",
}

export default function WatermarkPage() {
  return <WatermarkLoader />
}
