import { Metadata } from 'next'
import ImageToPdfLoader from './image-to-pdf-loader'

export const metadata: Metadata = {
  title: "Convert Image to PDF - JPG, PNG to PDF Online for Free | Docoria",
  description: "Convert your photos, screenshots, and images to high-quality PDF documents online. Supports JPG, PNG, and more. Fast, free, and secure client-side processing.",
  keywords: ["image to pdf", "jpg to pdf", "png to pdf", "photos to pdf", "convert images to pdf", "free image converter", "pdf maker from images"],
  alternates: {
      canonical: "https://docoria.com/image-to-pdf",
  },
  openGraph: {
      title: "Image to PDF - Best Free Photo to PDF Converter",
      description: "Turn your images into professional PDFs instantly. Drag & drop support for JPG, PNG, and more.",
      type: "website",
      url: "https://docoria.com/image-to-pdf",
      images: [
          {
              url: "/og-image-to-pdf.jpg",
              width: 1200,
              height: 630,
              alt: "Image to PDF Converter",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Convert Images to PDF - Fast & Free",
      description: "Create PDFs from your photos instantly. No uploads required for 100% privacy.",
      creator: "@docoria",
  }
}

export default function ImageToPdfPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria Image to PDF Converter",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Convert multiple images (JPG, PNG) into a single PDF document securely in your browser.",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1800"
      },
      "featureList": "Client-side processing, High quality output, Multiple image support, Secure, Drag and drop"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImageToPdfLoader />
    </>
  )
}
