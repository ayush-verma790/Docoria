import { Metadata } from 'next'
import ScannerClient from './scanner-client'

export const metadata: Metadata = {
  title: "Pro Vision Scanner - Free Online Document Scanner & OCR",
  description: "Scan documents, extract text (OCR), and enhance images directly in your browser. Convert photos to clear, editable text instantly.",
  keywords: ["online scanner", "ocr online", "image to text", "scan document", "extract text from image", "webcam scanner"],
  alternates: {
      canonical: "https://docoria.com/scanner",
  },
  openGraph: {
      title: "Pro Vision Scanner - Online OCR Tool",
      description: "Turn your camera or images into a powerful document scanner with AI text extraction.",
      type: "website",
      url: "https://docoria.com/scanner",
      images: [
          {
              url: "/og-scanner.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Pro Scanner",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Scan & Extract Text Online",
      description: "Free online document scanner with OCR capabilities.",
      creator: "@docoria",
  }
}

export default function ScannerPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Pro Vision Scanner",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based document scanner with image enhancement and Tesseract OCR for text extraction.",
      "featureList": "Image Scanning, OCR Text Extraction, Image Enhancement, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "ratingCount": "850"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ScannerClient />
      </>
  )
}
