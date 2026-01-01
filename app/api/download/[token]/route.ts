import { type NextRequest, NextResponse } from "next/server"
import { getSharedLinkByToken, getDocumentById } from "@/lib/db"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const link = await getSharedLinkByToken(params.token)
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 403 })
    }

    if (!link.allow_download) {
      return NextResponse.json({ error: "Download not allowed" }, { status: 403 })
    }

    const document = await getDocumentById(link.document_id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const filePath = join(process.cwd(), "public", document.file_path)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${document.original_filename}"`,
        "Content-Type": document.file_type || "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
