import { Metadata } from 'next'
import SignLoader from './sign-loader'

export const metadata: Metadata = {
  title: "Sign PDF Online | Electronic Signature for Documents",
  description: "Sign PDF documents online for free. Draw your e-signature and place it anywhere on your PDF. Fast, secure and legal.",
}

export default function SignPage() {
  return <SignLoader />
}
