import { Metadata } from 'next'
import PdfToJpgLoader from './pdf-to-jpg-loader'

export const metadata: Metadata = {
  title: "Convert PDF to JPG | Extract Images from PDF Online",
  description: "Turn your PDF pages into high-quality JPG images instantly. Extract every page as a separate image file for free.",
}

export default function PdfToJpgPage() {
  return <PdfToJpgLoader />
}
