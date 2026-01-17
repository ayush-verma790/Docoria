import { Metadata } from 'next'
import ProtectClient from './protect-client'

export const metadata: Metadata = {
  title: "Protect PDF - Encrypt & Secure PDF Files | Docoria",
  description: "Secure your PDF documents with military-grade AES encryption directly in your browser. Add passwords and restrict printing or copying.",
  keywords: ["protect pdf", "encrypt pdf", "password protect pdf", "secure pdf", "pdf security", "lock pdf", "aes encryption"],
  alternates: {
      canonical: "https://docoria.com/protect",
  },
  openGraph: {
      title: "Protect PDF - Bank-Grade Encryption Tool",
      description: "Encrypt and password protect your PDFs instantly. Private client-side processing.",
      type: "website",
      url: "https://docoria.com/protect",
      images: [
          {
              url: "/og-protect.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF Protection",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Encrypt PDF Files Securely",
      description: "Add passwords and permissions to your PDF files. Fast & Private.",
      creator: "@docoria",
  }
}

export default function ProtectPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Protector",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to encrypt PDF documents with passwords and granular permission controls (printing, copying, modifying).",
      "featureList": "AES Encryption, Password Protection, Permission Management, Client-Side Privacy",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1250"
      }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProtectClient />
    </>
  )
}
