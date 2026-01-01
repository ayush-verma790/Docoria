import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createDocument, createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_UPLOADS = 10

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const usage = await getUsageToday(user.userId)
    if (usage && usage.uploads_used >= MAX_DAILY_UPLOADS) {
      return NextResponse.json({ error: `Daily upload limit (${MAX_DAILY_UPLOADS}) reached` }, { status: 429 })
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const filepath = join(UPLOAD_DIR, filename)

    await writeFile(filepath, buffer)

    const doc = await createDocument(user.userId, file.name, file.type, file.size, `/uploads/${filename}`)
    await createOrUpdateUsageTracking(user.userId, "uploads_used", 1)

    return NextResponse.json({ success: true, document: doc })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
