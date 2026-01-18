import { Metadata } from 'next'


export const metadata: Metadata = {
  title: "Crop PDF - Trim Margins & Adjust Page Area | Docoria",
  description: "Crop PDF pages online. Adjustable crop box to remove white margins or focus on specific content. Free & Private.",
  keywords: ["crop pdf", "trim pdf", "remove pdf margins", "pdf cropper", "resize pdf page area", "cut pdf pages"],
  alternates: {
      canonical: "https://docoria.com/crop",
  },
  openGraph: {
      title: "Crop Studio - Precise PDF Trimming",
      description: "Visually crop your PDF documents to remove unwanted borders.",
      type: "website",
      url: "https://docoria.com/crop",
      images: [
          {
              url: "/og-crop.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria PDF Cropper",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Crop PDF Pages Online",
      description: "Visual tool to crop and trim PDF documents instantly.",
      creator: "@docoria",
  }
}

import CropLoader from './crop-loader'

export default function CropPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Crop Studio",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Browser-based tool to visually crop PDF pages and remove margins.",
      "featureList": "Visual Cropping, box selection, Margin Removal, Client-Side Processing",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "ratingCount": "180"
      }
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CropLoader />
      </>
  )
}
