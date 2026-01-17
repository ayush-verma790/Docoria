import { Metadata } from 'next'
import ResizeClient from './resize-client'

export const metadata: Metadata = {
  title: "Resize PDF - Scale to A4, Letter & Social Media | Docoria",
  description: "Resize PDF pages to standard formats (A4, Letter) or custom dimensions. Create Instagram stories and LinkedIn slides from PDF pages.",
  keywords: ["resize pdf", "scale pdf pages", "pdf to a4", "pdf to letter", "change pdf page size", "custom pdf size"],
  alternates: {
      canonical: "https://docoria.com/resize",
  },
  openGraph: {
      title: "Resize Studio - Scale PDF Documents",
      description: "Convert PDFs to A4, Letter, legal, or social media formats instantly.",
      type: "website",
      url: "https://docoria.com/resize",
      images: [
          {
              url: "/og-resize.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Resize PDF",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Resize & Scale PDF Files",
      description: "Change PDF dimensions to any custom size or standard format.",
      creator: "@docoria",
  }
}

export default function ResizePage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Resize Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to resize and scale PDF documents to standard or custom page sizes.",
      "featureList": "Page Resizing, A4/Letter Conversion, Social Media Formats, Custom Dimensions, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.6",
          "ratingCount": "285"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ResizeClient />
      </>
  )
}
