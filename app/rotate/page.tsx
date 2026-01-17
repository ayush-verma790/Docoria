import { Metadata } from 'next'
import OrganizeClient from '../organize/organize-client'

export const metadata: Metadata = {
  title: "Rotate PDF - Permanently Rotate PDF Pages Online | Docoria",
  description: "Rotate PDF pages 90, 180, or 270 degrees. Save the rotated orientation permanently. Free online PDF rotator.",
  keywords: ["rotate pdf", "turn pdf pages", "pdf orientation", "rotate pdf permanently", "save pdf rotation"],
  alternates: {
      canonical: "https://docoria.com/rotate",
  },
  openGraph: {
      title: "Rotate PDF Pages - Docoria",
      description: "Fix sideways or upside-down PDF pages instantly.",
      type: "website",
      url: "https://docoria.com/rotate",
      images: [
          {
              url: "/og-rotate.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Rotate PDF",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Rotate PDF Pages Online",
      description: "Rotate specific pages or entire documents permanently.",
      creator: "@docoria",
  }
}

export default function RotatePage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Rotate Tool",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Tool to rotate PDF pages and save the orientation.",
      "featureList": "Page Rotation, Reordering, Client-Side Processing, No Limits",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <OrganizeClient title="Rotate PDF Pages" />
      </>
  )
}
