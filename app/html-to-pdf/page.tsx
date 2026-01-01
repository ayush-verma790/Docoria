import { Metadata } from 'next'
import HtmlToPdfLoader from './html-to-pdf-loader'

export const metadata: Metadata = {
  title: "HTML to PDF Online | Convert Webpage to PDF for Free",
  description: "Transform any public URL into a professional PDF document. Best-in-class rendering for websites, reports, and articles.",
}

export default function HtmlToPdfPage() {
  return <HtmlToPdfLoader />
}
