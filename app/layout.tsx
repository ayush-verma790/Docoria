import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
})

export const metadata: Metadata = {
  title: {
    default: "Docorio — #1 Free All-in-One Document Suite",
    template: "%s | Docorio"
  },
  description: "Transform any file into a high-quality PDF or convert PDFs to Word, Excel, PowerPoint, images, and other formats. Docorio offers lightning-fast merging, splitting, compression, and professional PDF tools—all processed privately in your browser.",
  keywords: [
    "AI PDF tools", "PDF editor online", "Merge PDF free", "Split PDF", "Compress PDF size", 
    "PDF to Word converter", "Word to PDF", "OCR PDF searchable", "Sign PDF e-signature", 
    "summarize PDF AI", "extract data from PDF", "secure document sharing", 
    "document workflow automation", "cloud document management", "legal document management",
    "contract management software", "free PDF tools", "PDF automation"
  ],
  authors: [{ name: "Docorio Team" }],
  creator: "Docorio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docorio.com",
    title: "Docorio — #1 AI-Powered All-in-One Document Workspace",
    description: "Combine, split, and convert documents with the speed of light. AI-enhanced summarization and secure OCR.",
    siteName: "Docorio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docorio — Document Management Redefined",
    description: "The #1 choice for fast and secure document processing.",
    creator: "@docorio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  verification: {
    google: "nV_VxMMDUuY4FLrke-HpbRTgYR8YzId48PQ9IhJN18g",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased bg-slate-950 text-slate-200 selection:bg-violet-500/30 selection:text-violet-200 uppercase-headings`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
