import { Metadata } from 'next'
import ChatLoader from './chat-loader'

export const metadata: Metadata = {
  title: "ChatPDF | Talk to your PDF Documents with AI",
  description: "Upload any PDF and ask questions using our free advanced AI. Get instant answers, summaries, and insights securely.",
}

export default function ChatPDFPage() {
  return <ChatLoader />
}
