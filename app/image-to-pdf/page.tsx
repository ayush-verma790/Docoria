import { Metadata } from 'next'
import ImageToPdfLoader from './image-to-pdf-loader'

export const metadata: Metadata = {
  title: "Convert Image to PDF | JPG & PNG to PDF Converter",
  description: "Combine your photos, screenshots, and graphics into professional PDF documents. Supports JPG, PNG, and multiple image uploads.",
}

export default function ImageToPdfPage() {
  return <ImageToPdfLoader />
}
