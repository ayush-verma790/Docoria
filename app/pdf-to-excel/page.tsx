import ConvertLoader from "@/app/convert/convert-loader"

export const metadata = {
  title: "PDF to Excel Converter | Docorio",
  description: "Convert your PDF tables and data into editable Microsoft Excel spreadsheets with high accuracy.",
}

export default function PdfToExcelPage() {
  return <ConvertLoader initialFormat="xlsx" />
}
