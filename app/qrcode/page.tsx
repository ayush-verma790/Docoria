import { Metadata } from 'next'
import QrCodeClient from './qrcode-client'

export const metadata: Metadata = {
  title: "Free QR Code Generator | Create Custom QR Codes",
  description: "Generate high-quality QR codes for links, text, and documents instantly. Free, fast, and no registration required.",
}

export default function QrCodePage() {
  return <QrCodeClient />
}
