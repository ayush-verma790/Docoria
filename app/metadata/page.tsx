import { Metadata } from 'next'
import MetadataClient from './metadata-client'

export const metadata: Metadata = {
  title: "Edit PDF Metadata | Modify PDF Properties Online",
  description: "Change hidden properties like PDF Author, Title, Keywords, and Subject. Professional tool for document descriptors.",
}

export default function MetadataPage() {
  return <MetadataClient />
}
