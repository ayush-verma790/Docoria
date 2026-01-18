import { Metadata } from 'next'
import CompareClient from './compare-client'

export const metadata: Metadata = {
  title: "Compare PDF - Visualize Differences Online | Docoria",
  description: "Compare two PDF documents side-by-side or with overlay. Spot differences instantly. Free & Private.",
  keywords: ["compare pdf", "pdf diff", "compare documents", "pdf overlay", "find differences in pdf"],
  alternates: {
      canonical: "https://docoria.com/compare",
  },
  openGraph: {
      title: "Compare PDF Studio - Docoria",
      description: "Visual comparison tool for PDF documents.",
      type: "website",
      url: "https://docoria.com/compare",
      images: [
          {
              url: "/og-compare.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF Comparison",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Compare PDFs Online",
      description: "Find differences between two PDF versions instantly.",
      creator: "@docoria",
  }
}

export default function ComparePage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Compare Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to visually compare two PDF files.",
      "featureList": "Overlay Mode, Side-by-Side View, Opacity Control, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "ratingCount": "90"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CompareClient />
      </>
  )
}
