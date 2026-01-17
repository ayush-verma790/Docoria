import { Metadata } from 'next'
import SplitLoader from './split-loader'

export const metadata: Metadata = {
  title: "Split PDF Online - Extract Pages Free & Fast | Docoria",
  description: "Extract specific pages or separate PDF files instantly. Client-side processing ensures 100% privacy and speed. No upload limits.",
  keywords: ["split pdf", "extract pdf pages", "separate pdf", "cut pdf pages", "pdf separator", "free pdf splitter", "client side pdf tool"],
  alternates: {
      canonical: "https://docoria.com/split",
  },
  openGraph: {
      title: "Split PDF Studio - Extract Text & Pages Instantly",
      description: "Secure, private PDF splitting in your browser. Choose pages visually and download effectively.",
      type: "website",
      url: "https://docoria.com/split",
      images: [
          {
              url: "/og-split.jpg",
              width: 1200,
              height: 630,
              alt: "Docoria Split PDF Studio",
          }
      ],
      siteName: "Docoria",
  },
  twitter: {
      card: "summary_large_image",
      title: "Fastest PDF Splitter - Docoria",
      description: "Split and extract PDF pages instantly without uploading files.",
      creator: "@docoria",
  }
}

export default function SplitPage() {
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Docoria PDF Splitter",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
      },
      "description": "Free online tool to split PDF files and extract specific pages. Features client-side processing for maximum privacy.",
      "featureList": "Visual Page Selection, Page Range Extraction, Instant Download, 100% Client-Side Privacy",
      "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1500"
      }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SplitLoader />
    </>
  )
}
