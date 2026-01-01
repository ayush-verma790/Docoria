import { Metadata } from 'next'
import ConvertLoader from './convert-loader'

export const metadata: Metadata = {
  title: "Convert PDF to Word, Excel & PPT | Free Online Converter",
  description: "Transform your PDF documents into editable Word, Excel, and PowerPoint files instantly. High-quality conversion with formatting preserved.",
}

export default function ConvertPage() {
  return <ConvertLoader />
}
