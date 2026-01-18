import { Metadata } from 'next'
import PdfToTextClient from './pdf-to-text-client'

export const metadata: Metadata = {
  title: "Convert PDF to Text - Extract Content Online | Docoria",
  description: "Extract text from your PDF documents instantly. Convert PDF to editable text format (TXT). Free & Secure.",
  keywords: ["pdf to text", "extract text from pdf", "convert pdf to txt", "pdf scraper", "read pdf text"],
  alternates: {
      canonical: "https://docoria.com/pdf-to-text",
  },
  openGraph: {
      title: "PDF to Text Studio - Docoria",
      description: "Convert PDF documents to editable text instantly.",
      type: "website",
      url: "https://docoria.com/pdf-to-text",
      images: [
          {
              url: "/og-text.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF to Text",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "PDF to Text Converter",
      description: "Extract text content from PDFs securely in your browser.",
      creator: "@docoria",
  }
}

export default function PdfToTextPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF to Text Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to extract text content from PDF files.",
      "featureList": "Instant Extraction, Batch Processing (Single File), Copy to Clipboard, Download TXT",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.6",
          "ratingCount": "85"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PdfToTextClient />
      </>
  )
}
