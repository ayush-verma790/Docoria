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
    default: "Docorio - Free PDF Editor, Converter, Merger & AI Tools",
    template: "%s | Docorio",
  },
  description: "The best free online PDF editor. Merge, split, compress, convert, sign, and edit PDFs instantly. 100% free, secure, and works offline in your browser.",
  keywords: [
    "pdf editor", "free pdf converter", "merge pdf online", "compress pdf", 
    "pdf to word", "remove background", "passport photo maker", "esign pdf", 
    "edit pdf text", "combine pdfs", "jpg to pdf", "extract text from pdf",
    "pdf ai assistant", "chat with pdf", "local pdf tools"
  ],
  authors: [{ name: "Docorio Team" }],
  creator: "Docorio",
  metadataBase: new URL("https://docorio.com"), // Placeholder, should be env var in real prod
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docorio.com",
    title: "Docorio - Free PDF Editor & Converter Suite",
    description: "Edit, Convert, and Sign PDFs for free. No signup required. Fast, secure, and local.",
    siteName: "Docorio",
    images: [
      {
        url: "/og-image.jpg", // Placeholder
        width: 1200,
        height: 630,
        alt: "Docorio PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Tools - Edit, Convert & Sign",
    description: "The ultimate free PDF and Image toolkit. No limits, no signup.",
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
        ]
      },
      {
        "@type": "SiteNavigationElement",
        "name": "Merge PDF",
        "url": "https://docorio.com/merge",
        "description": "Combine multiple PDFs into one file."
      },
      {
        "@type": "SiteNavigationElement",
        "name": "Edit PDF",
        "url": "https://docorio.com/edit",
        "description": "Add text, images, and shapes to PDF."
      },
      {
        "@type": "SiteNavigationElement",
        "name": "Sign PDF",
        "url": "https://docorio.com/sign",
        "description": "Add digital signatures to documents."
      },
      {
        "@type": "SiteNavigationElement",
        "name": "Chat with PDF",
        "url": "https://docorio.com/chat-pdf",
        "description": "Ask questions to your PDF using AI."
      },
      {
        "@type": "SiteNavigationElement",
        "name": "Compress PDF",
        "url": "https://docorio.com/compress",
        "description": "Reduce PDF file size."
      }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${spaceGrotesk.variable} ${inter.variable}`}> 
      <body className={`font-sans antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground min-h-screen transition-colors duration-300`}>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
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
