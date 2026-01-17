import { Metadata } from 'next'
import PageNumbersClient from './page-numbers-client'

export const metadata: Metadata = {
  title: "Numbering Studio - Add Page Numbers to PDF | Docoria",
  description: "Easily add customized page numbers to your PDF documents online. Choose position, font, size, and format. Free & Private.",
  keywords: ["add page numbers to pdf", "pdf numbering", "number pdf pages", "pdf pagination", "page count pdf"],
  alternates: {
      canonical: "https://docoria.com/page-numbers",
  },
  openGraph: {
      title: "Numbering Studio - Smart PDF Pagination",
      description: "Add professional page numbers to your PDFs in seconds.",
      type: "website",
      url: "https://docoria.com/page-numbers",
      images: [
          {
              url: "/og-numbering.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF Numbering",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Add Page Numbers to PDF",
      description: "Customize and apply page numbers to your PDF documents instantly.",
      creator: "@docoria",
  }
}

export default function PageNumbersPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Numbering Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to add customizable page numbers to PDF documents.",
      "featureList": "Custom Page Numbers, Position Control, Font Customization, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1560"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PageNumbersClient />
      </>
  )
}
