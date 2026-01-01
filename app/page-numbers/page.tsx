import { Metadata } from 'next'
import PageNumbersClient from './page-numbers-client'

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF | Online PDF Page Numbering",
  description: "Automatically number all pages in your PDF document. Customize position, font, and starting number with ease.",
}

export default function PageNumbersPage() {
  return <PageNumbersClient />
}
