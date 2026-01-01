import { Metadata } from 'next'
import ScannerLoader from './scanner-loader'

export const metadata: Metadata = {
  title: "AI Text Scanner | Online OCR for Images & Documents",
  description: "Extract text from photos and scans using high-accuracy AI OCR. Copy or download extracted text in seconds.",
}

export default function ScannerPage() {
  return <ScannerLoader />
}
