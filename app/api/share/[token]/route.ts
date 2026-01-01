import { type NextRequest, NextResponse } from "next/server"
import { getSharedLinkByToken, getDocumentById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const link = await getSharedLinkByToken(params.token)
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 403 })
    }

    const document = await getDocumentById(link.document_id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: document.id,
      filename: document.original_filename,
      fileSize: document.original_size,
      fileType: document.file_type,
      viewOnly: link.view_only,
      expiresAt: link.expires_at,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get shared link" }, { status: 500 })
  }
}
