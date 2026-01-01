import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { resizeImage } from "@/lib/compression"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { writeFile, mkdir, rm } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_EDITS = 10

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await getUsageToday(user.userId)
    if (usage && usage.edits_used >= MAX_DAILY_EDITS) {
      return NextResponse.json({ error: `Daily resize limit (${MAX_DAILY_EDITS}) reached` }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const inputFile = join(UPLOAD_DIR, `input-${Date.now()}.tmp`)
    const outputFile = join(UPLOAD_DIR, `resized-${Date.now()}-${file.name}`)

    await writeFile(inputFile, buffer)

    let width = 210,
      height = 297
    if (type === "letter") {
      width = 216
      height = 279
    } else if (type === "custom") {
      width = Number.parseInt(formData.get("width") as string) || 210
      height = Number.parseInt(formData.get("height") as string) || 297
    }

    await resizeImage(inputFile, outputFile, width * 10, height * 10)

    try {
      await rm(inputFile)
    } catch (e) {}

    await createOrUpdateUsageTracking(user.userId, "edits_used", 1)

    return NextResponse.json({
      downloadUrl: `/uploads/${outputFile.split("/").pop()}`,
    })
  } catch (error) {
    console.error("Resize error:", error)
    return NextResponse.json({ error: "Resize failed" }, { status: 500 })
  }
}
