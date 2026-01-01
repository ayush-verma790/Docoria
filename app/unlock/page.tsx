import { Metadata } from 'next'
import UnlockClient from './unlock-client'

export const metadata: Metadata = {
  title: "Unlock PDF Online | Remove PDF Passwords & Restrictions",
  description: "Remove passwords, printing limits, and security restrictions from your PDF files safely and instantly.",
}

export default function UnlockPage() {
  return <UnlockClient />
}
