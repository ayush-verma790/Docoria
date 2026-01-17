import { Metadata } from 'next'
import CompressClient from './compress-client'

export const metadata: Metadata = {
  title: "Compress PDF - Reduce PDF File Size Online for Free | Best PDF Optimizer",
  description: "Reduce PDF file size online for free without losing quality. Optimize documents for email, web, and storage. Choose compression level or target file size.",
  keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf optimizer", "online pdf compressor", "free pdf compression", "pdf size reducer"],
  alternates: {
      canonical: "https://docoria.com/compress",
  },
  openGraph: {
      title: "Compress PDF - Best Free Online PDF Optimizer",
      description: "Shrink your PDF files instantly. Smart compression technology reduces size while maintaining quality.",
      type: "website",
      url: "https://docoria.com/compress",
      images: [
          {
              url: "/og-compress.jpg",
              width: 1200,
              height: 630,
              alt: "Compress PDF Tool",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Compress PDF - Reduce Size Instantly",
      description: "Optimize your PDFs for free. Fast, secure, and high-quality compression.",
      creator: "@docoria",
  }
}

export default function CompressPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Compressor",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to compress and reduce PDF file size online while maintaining quality.",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "2150"
      },
      "featureList": "Lossless compression, High quality reduction, Target size mode, Bulk processing"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompressClient />
    </>
  )
}
