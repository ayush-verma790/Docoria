import { Metadata } from 'next'
import SignLoader from './sign-loader'

export const metadata: Metadata = {
  title: "eSign PDF Online - Free Electronic Signature Studio | Docoria",
  description: "Sign PDF documents securely in your browser. Draw, type, or upload your signature. Place it anywhere with our professional eSignature Studio. 100% Free & Private.",
  keywords: ["sign pdf", "electronic signature", "editor pdf signature", "digital signature free", "add signature to pdf", "draw signature online", "esign studio"],
  alternates: {
      canonical: "https://docoria.com/sign",
  },
  openGraph: {
      title: "eSignature Studio - Sign PDFs Free & Securely",
      description: "Create professional electronic signatures instantly. Draw, Type, or Upload. No signup required.",
      type: "website",
      url: "https://docoria.com/sign",
      images: [
          {
              url: "/og-sign.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria eSignature Studio",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Sign PDFs in Seconds - eSignature Studio",
      description: "Secure, client-side electronic signatures for your documents.",
      creator: "@docoria",
  }
}

export default function SignPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria eSignature Studio",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to electronically sign PDF documents. Supports drawing, typing, and image uploads for signatures.",
      "featureList": "Draw Signature, Type Signature (Calligraphy Fonts), Upload Image, Drag & Drop Placement, Client-Side Privacy",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "2100"
      }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SignLoader />
    </>
  )
}
