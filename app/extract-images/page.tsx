import { Metadata } from 'next'


export const metadata: Metadata = {
  title: "Extract Images from PDF - Download Embedded Photos | Docoria",
  description: "Instantly extract all images and photos from your PDF document in original quality. Save as JPG or PNG.",
  keywords: ["extract images pdf", "pdf image extractor", "download photos from pdf", "rip images from pdf", "pdf assets"],
  alternates: {
      canonical: "https://docoria.com/extract-images",
  },
  openGraph: {
      title: "Extract Images Studio - Docoria",
      description: "Pull standard high-quality images out of any PDF file.",
      type: "website",
      url: "https://docoria.com/extract-images",
      images: [
          {
              url: "/og-extract.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Image Extraction",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Extract PDF Images Free",
      description: "Get original quality images from your PDF files.",
      creator: "@docoria",
  }
}

import ExtractImagesLoader from './extract-images-loader'

export default function ExtractImagesPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Extract Images Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to extract embedded images from PDF documents.",
      "featureList": "Original Quality Extraction, Batch Download, ZIP Support, Preview Gallery",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "120"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ExtractImagesLoader />
      </>
  )
}
