import { Metadata } from 'next'
import FlattenClient from './flatten-client'

export const metadata: Metadata = {
  title: "Flatten PDF Online | Merge PDF Layers & Forms",
  description: "Flatten your PDF documents to merge all layers, annotations, and form fields into a single, non-editable background.",
}

export default function FlattenPage() {
  return <FlattenClient />
}
