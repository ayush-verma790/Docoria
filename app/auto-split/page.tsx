import { Metadata } from 'next'


export const metadata: Metadata = {
  title: "Auto Split PDF - Split by Page, Size or Text | Docoria",
  description: "Advanced PDF splitter. Split PDF files automatically by page interval, file size, or text content triggers. Free power tool.",
  keywords: ["auto split pdf", "split pdf by text", "split pdf by size", "chunk pdf", "pdf separator", "automated pdf splitting"],
  alternates: {
      canonical: "https://docoria.com/auto-split",
  },
  openGraph: {
      title: "Auto Split Studio - Docoria",
      description: "Smart PDF splitting by content, size, or page count.",
      type: "website",
      url: "https://docoria.com/auto-split",
      images: [
          {
              url: "/og-auto-split.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Auto Split",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Smart PDF Splitter",
      description: "Split PDFs by content or size instantly.",
      creator: "@docoria",
  }
}

import AutoSplitLoader from './auto-split-loader'

export default function AutoSplitPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Auto Split Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to automatically split PDF files based on various criteria.",
      "featureList": "Split by Interval, Split by File Size, Split by Text/Content Match, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "45"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AutoSplitLoader />
      </>
  )
}
