import { Metadata } from 'next'
import SplitLoader from './split-loader'

export const metadata: Metadata = {
  title: "Split PDF Online | Separate PDF Pages for Free",
  description: "Extract specific pages from your PDF or split documents into independent files. Fast, secure, and easy to use.",
}

export default function SplitPage() {
  return <SplitLoader />
}
