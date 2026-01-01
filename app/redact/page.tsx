import { Metadata } from 'next'
import RedactLoader from './redact-loader'

export const metadata: Metadata = {
  title: "Redact PDF Online | Hide Sensitive Data in PDF for Free",
  description: "Securely black out names, numbers, or private info in your PDF permanently. High-security redaction tool processed entirely in your browser.",
}

export default function RedactPage() {
  return <RedactLoader />
}
