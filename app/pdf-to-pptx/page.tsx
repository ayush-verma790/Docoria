import ConvertLoader from "@/app/convert/convert-loader"

export const metadata = {
  title: "PDF to PowerPoint Converter | Docorio",
  description: "Transform your PDF presentations into editable Microsoft PowerPoint (PPTX) files instantly.",
}

export default function PdfToPptPage() {
  return <ConvertLoader initialFormat="pptx" />
}
