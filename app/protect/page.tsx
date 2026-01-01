import { Metadata } from 'next'
import ProtectClient from './protect-client'

export const metadata: Metadata = {
  title: "Protect PDF Online | Password Protect PDF Files",
  description: "Secure your PDF documents with high-level encryption and passwords. Prevent unauthorized opening and editing of your sensitive data.",
}

export default function ProtectPage() {
  return <ProtectClient />
}
