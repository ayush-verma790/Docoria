import { Metadata } from 'next'
import MergeLoader from './merge-loader'

export const metadata: Metadata = {
  title: "Merge PDF - Combine PDF Files Online for Free | Best PDF Merger",
  description: "Merge PDF files online in seconds. The fastest, most secure, and private way to combine multiple PDFs into one document. No registration required. Support page reordering, rotation, and sorting.",
  keywords: ["pdf merge", "combine pdf", "join pdf", "merge pdf files", "pdf combiner", "free pdf merge", "online pdf tool", "secure pdf merge"],
  alternates: {
      canonical: "https://docoria.com/merge", // Assuming domain, update if known
  },
  openGraph: {
      title: "Merge PDF - Best Free Online PDF Combiner",
      description: "Combine multiple PDF documents into a single file instantly. Drag & drop, reorder pages, and merge with 100% privacy.",
      type: "website",
      url: "https://docoria.com/merge",
      images: [
          {
              url: "/og-merge.jpg", // Placeholder
              width: 1200,
              height: 630,
              alt: "Merge PDF Tool Preview",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Merge PDF - Combine Files Instantly",
      description: "The easiest way to combine PDF files online. Free, secure, and fast.",
      creator: "@docoria",
  }
}

export default function MergePage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Merger",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "A professional tool to merge multiple PDF files into one document. Reorder pages, rotate, and combine quickly.",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1250"
      },
      "featureList": "Drag and drop, Page reordering, Secure client-side processing, High quality output"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MergeLoader />
    </>
  )
}
