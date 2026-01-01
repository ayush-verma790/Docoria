import { Metadata } from 'next'
import EditLoader from './edit-loader'

export const metadata: Metadata = {
  title: "Edit PDF Online | Free PDF Editor & Annotator",
  description: "Add text, signatures, and annotations to your PDF documents directly in your browser. No software installation required.",
}

export default function EditPage() {
  return <EditLoader />
}
