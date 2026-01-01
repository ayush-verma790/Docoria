import { Metadata } from 'next'
import MergeLoader from './merge-loader'

export const metadata: Metadata = {
  title: "Merge PDF Files Online | Combine Multiple PDFs for Free",
  description: "Combine multiple PDF documents into a single file in seconds. Easy drag-and-drop interface, secure and private browser processing.",
}

export default function MergePage() {
  return <MergeLoader />
}
