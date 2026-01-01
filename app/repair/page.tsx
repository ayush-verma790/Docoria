import { Metadata } from 'next'
import RepairLoader from './repair-loader'

export const metadata: Metadata = {
  title: "Repair PDF Online | Fix Corrupt & Broken PDF Files",
  description: "Easily fix PDFs that won't open or show errors. Our repair engine rebuilds the document structure safely in your browser.",
}

export default function RepairPage() {
  return <RepairLoader />
}
