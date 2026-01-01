import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createSharedLink, getDocumentById } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doc = await getDocumentById(Number.parseInt(params.id))
    if (!doc || doc.user_id !== user.userId) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const link = await createSharedLink(doc.id, true, false)
    return NextResponse.json({ token: link.token })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
