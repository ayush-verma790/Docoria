import { Metadata } from 'next'
import SummarizerLoader from './summarizer-loader'

export const metadata: Metadata = {
  title: "AI Summarizer | Condense Long PDFs Instantly",
  description: "Get quick, accurate summaries of your PDF documents. Choose between concise, bullet-point, or detailed breakdowns.",
}

export default function SummarizerPage() {
  return <SummarizerLoader />
}
