import { Metadata } from 'next'
import FlattenClient from './flatten-client'

export const metadata: Metadata = {
  title: "Flatten PDF - Merge Layers & Lock PDF Forms | Docoria",
  description: "Permanently merge PDF layers, flatten forms to prevent editing, and lock your document content. processing for privacy.",
  keywords: ["flatten pdf", "lock pdf", "merge pdf layers", "make pdf read only", "flatten pdf forms", "pdf security"],
  alternates: {
      canonical: "https://docoria.com/flatten",
  },
  openGraph: {
      title: "Flatten Studio - Lock PDF Content",
      description: "Convert fillable forms into permanent text securely in your browser.",
      type: "website",
      url: "https://docoria.com/flatten",
      images: [
          {
              url: "/og-flatten.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Flatten PDF",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Flatten & Lock PDF Files",
      description: "Prevent editing by flattening your PDF forms and annotations.",
      creator: "@docoria",
  }
}

export default function FlattenPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Flatten Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to flatten PDF forms and annotations, making them permanent and non-editable.",
      "featureList": "Form Flattening, Annotation Merging, Document Locking, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "320"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <FlattenClient />
      </>
  )
}
