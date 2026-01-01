import { Metadata } from 'next'
import OrganizeLoader from './organize-loader'

export const metadata: Metadata = {
  title: "Organize PDF Pages | Reorder & Manage PDF Online",
  description: "Rearrange, rotate, and delete pages in your PDF document effortlessly. Professional tools for document page management.",
}

export default function OrganizePage() {
  return <OrganizeLoader />
}
