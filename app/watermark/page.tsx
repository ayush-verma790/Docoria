import { Metadata } from 'next'
import WatermarkLoader from './watermark-loader'

export const metadata: Metadata = {
  title: "Watermark PDF Online - Add Stamp, Logo, or Text | Docoria",
  description: "Secure your PDF documents with custom text or image watermarks. Add logos, copyright stamps, or confidential labels instantly online. 100% Free and Private.",
  keywords: ["watermark pdf", "add logo to pdf", "stamp pdf", "pdf copyright protection", "secure pdf", "pdf watermarker", "confidential pdf stamp"],
  alternates: {
      canonical: "https://docoria.com/watermark",
  },
  openGraph: {
      title: "Watermark PDF - Protect Your Documents",
      description: "Add professional watermarks to your PDFs in seconds. Text, logos, and tiled patterns supported.",
      type: "website",
      url: "https://docoria.com/watermark",
      images: [
          {
              url: "/og-watermark.jpg",
              width: 1200,
              height: 630,
              alt: "Watermark PDF Tool",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Watermark PDF - Secure & Free",
      description: "Protect your intellectual property. Add watermarks to PDFs directly in your browser.",
      creator: "@docoria",
  }
}

export default function WatermarkPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Watermarker",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to add text or image watermarks to PDF files for security and branding.",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1500"
      },
      "featureList": "Text and Image watermarks, Tiled patterns, Custom positioning, Client-side privacy, Batch processing"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatermarkLoader />
    </>
  )
}
