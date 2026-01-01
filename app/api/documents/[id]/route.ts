import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDocumentById } from "@/lib/db"
import { rm } from "fs/promises"
import { join } from "path"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doc = await getDocumentById(Number.parseInt(params.id))
    if (!doc || doc.user_id !== user.userId) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    try {
      await rm(join(process.cwd(), "public", doc.file_path))
    } catch (e) {
      console.error("[v0] Failed to delete file:", e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete document error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
