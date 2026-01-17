import { Metadata } from 'next'
import PdfToJpgLoader from './pdf-to-jpg-loader'

export const metadata: Metadata = {
  title: "PDF to JPG Converter - HD Quality & Secure | Docoria",
  description: "Convert PDF pages to high-quality JPG or PNG images separately. Secure client-side conversion without file uploads. Batch download supported.",
  keywords: ["pdf to jpg", "pdf to image", "pdf to png", "convert pdf to picture", "extract images from pdf", "pdf to high quality image"],
  alternates: {
      canonical: "https://docoria.com/pdf-to-jpg",
  },
  openGraph: {
      title: "PDF to Image Studio - Convert to HD JPG/PNG",
      description: "Instantly convert PDF pages to images in your browser. Private, fast, and free.",
      type: "website",
      url: "https://docoria.com/pdf-to-jpg",
      images: [
          {
              url: "/og-pdf-to-jpg.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF to Image Converter",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Convert PDF to JPG/PNG Instantly",
      description: "High-quality PDF to image conversion in your browser.",
      creator: "@docoria",
  }
}

export default function PdfToJpgPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF to JPG Converter",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to convert PDF documents into high-resolution images (JPG/PNG). Features batch processing and client-side privacy.",
      "featureList": "PDF to JPG, PDF to PNG, High Resolution Output, Batch Download, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1850"
      }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PdfToJpgLoader />
    </>
  )
}
