import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: 'swap',
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
})

import { ThemeProvider } from "@/components/theme-provider"

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#02000d" },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "Docorio - AI Powered PDF & Image Tools",
    template: "%s | Docorio",
  },
  description: "The world's most advanced open-source document platform. Convert, edit, eSign, and protect PDFs and Images instantly. Local, secure, and free.",
  keywords: ["pdf converter", "image editor", "passport photo maker", "background remover", "pdf merge", "pdf split", "ocr", "ai pdf"],
  authors: [{ name: "Docorio Team" }],
  creator: "Docorio",
  metadataBase: new URL("https://docorio.com"), // Placeholder, should be env var in real prod
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docorio.com",
    title: "Docorio - Master Your Digital Docs",
    description: "Transform, merge, and edit PDFs with unmatched speed. Secure, local, and beautiful.",
    siteName: "Docorio",
    images: [
      {
        url: "/og-image.jpg", // Placeholder
        width: 1200,
        height: 630,
        alt: "Docorio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Docorio - AI PDF Tools",
    description: "The ultimate document suite for safety and speed.",
    images: ["/og-image.jpg"],
    creator: "@docorio",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Docorio",
        "url": "https://docorio.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://docorio.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "Docorio",
        "url": "https://docorio.com",
        "logo": "https://docorio.com/icon-dark-32x32.png",
        "sameAs": [
          "https://twitter.com/docorio",
          "https://github.com/docorio"
        ]
      }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable}`}> 
      <body className={`font-sans antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground min-h-screen transition-colors duration-300`}>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Global Background & Noise */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute inset-0 bg-background transition-colors duration-300"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>
            
            <SiteHeader />
            {children}
            <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
