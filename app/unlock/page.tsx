import { Metadata } from 'next'
import UnlockClient from './unlock-client'

export const metadata: Metadata = {
  title: "Unlock PDF - Remove Passwords & Restrictions | Docoria",
  description: "Instantly remove passwords and security restrictions from your PDF files. Decrypt documents client-side without uploading.",
  keywords: ["unlock pdf", "remove pdf password", "decrypt pdf", "pdf password remover", "pdf unlocker", "remove pdf security"],
  alternates: {
      canonical: "https://docoria.com/unlock",
  },
  openGraph: {
      title: "Unlock PDF - Instant Password Remover",
      description: "Remove PDF restrictions and passwords in your browser. Fast, free, and private.",
      type: "website",
      url: "https://docoria.com/unlock",
      images: [
          {
              url: "/og-unlock.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF Unlocker",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Unlock PDF Files Instantly",
      description: "Remove passwords from your PDF files securely.",
      creator: "@docoria",
  }
}

export default function UnlockPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Unlocker",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to remove passwords and restrictions from PDF documents. Decrypts files client-side.",
      "featureList": "Password Removal, Restriction Removal, Client-Side Decryption, Instant Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "980"
      }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UnlockClient />
    </>
  )
}
