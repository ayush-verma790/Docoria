import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit"
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://docorio-bzu7.vercel.app"),
  title: {
    default: "Docorio — #1 Free All-in-One Document Suite",
    template: "%s | Docorio"
  },
  description: "The world's fastest and most secure document tools. Transform any file into high-quality PDF, convert to Word/Excel, merge, split, and sign documents locally in your browser. 100% Free & Private.",
  keywords: [
    "Docorio", "Free PDF Editor", "Merge PDF", "Split PDF", "Compress PDF", 
    "PDF to Word", "PDF to Excel", "Word to PDF", "Image to PDF", "JPG to PDF", 
    "PNG to PDF", "OCR PDF", "Scan to Text", "eSign PDF", "Sign PDF Online", 
    "Unlock PDF", "Protect PDF", "Watermark PDF", "PDF Organizer", "Rotate PDF",
    "Flatten PDF", "Redact PDF", "Repair PDF", "HTML to PDF", "Resize PDF",
    "Add Page Numbers to PDF", "Edit PDF Metadata", "Secure PDF Tools", 
    "Browser-based PDF", "Local PDF Processing", "Best PDF Converter 2026"
  ],
  authors: [{ name: "Docorio Team", url: "https://docorio.com" }],
  creator: "Docorio",
  publisher: "Docorio Global",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Docorio — #1 Free All-in-One Document Suite",
    description: "Transform, Convert, Edit, and Sign PDFs instantly. No uploads required - 100% secure local processing. The fastest way to manage documents.",
    siteName: "Docorio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Docorio Document Suite",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Docorio — #1 Free All-in-One Document Suite",
    description: "Transform, Convert, Edit, and Sign PDFs instantly. No uploads required - 100% secure local processing.",
    creator: "@docorio",
    images: ["/og-image.png"],
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
  applicationName: "Docorio",
  appleWebApp: {
    capable: true,
    title: "Docorio",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-icon.png",
    },
  },
  verification: {
    google: "nV_VxMMDUuY4FLrke-HpbRTgYR8YzId48PQ9IhJN18g",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
