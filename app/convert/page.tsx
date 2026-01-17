import { Metadata } from 'next'
import ConvertLoader from './convert-loader'

export const metadata: Metadata = {
  title: "Convert PDF to Word, Excel & PPT | Free Online Converter",
  description: "Transform your PDF documents into editable Word, Excel, and PowerPoint files instantly. High-quality conversion with formatting preserved.",
}

export default function ConvertPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let format: "pdf" | "docx" | "xlsx" | "pptx" | "png" | "jpg" = "pdf"

  const to = searchParams.to as string
  const from = searchParams.from as string

  // Logic: "to" takes precedence if converting FROM PDF.
  if (to === "word") format = "docx"
  else if (to === "excel") format = "xlsx"
  else if (to === "ppt") format = "pptx"
  else if (to === "jpg") format = "jpg"
  else if (to === "png") format = "png"
  
  // Logic: "from" usually means converting TO PDF
  if (from) format = "pdf"

  return <ConvertLoader initialFormat={format} />
}
