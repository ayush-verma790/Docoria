import { Metadata } from 'next'
import MetadataClient from './metadata-client'

export const metadata: Metadata = {
  title: "Metadata Editor - Edit PDF Author, Title & Keywords | Docoria",
  description: "View, edit, and update hidden PDF metadata properties (Title, Author, Subject, Creator). Optimize your documents for search engines.",
  keywords: ["pdf metadata editor", "edit pdf properties", "change pdf author", "edit pdf title", "pdf meta tags", "document properties"],
  alternates: {
      canonical: "https://docoria.com/metadata",
  },
  openGraph: {
      title: "Metadata Studio - Edit PDF Properties",
      description: "Modify PDF details like Title, Author, and Keywords instantly.",
      type: "website",
      url: "https://docoria.com/metadata",
      images: [
          {
              url: "/og-metadata.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Metadata Editor",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Edit PDF Metadata Online",
      description: "Update PDF properties and metadata securely in your browser.",
      creator: "@docoria",
  }
}

export default function MetadataPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Metadata Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Professional tool to edit PDF metadata properties including Title, Author, Subject, and Keywords.",
      "featureList": "Metadata Editing, Title Update, Author Update, Keyword Management, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.6",
          "ratingCount": "420"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MetadataClient />
      </>
  )
}
