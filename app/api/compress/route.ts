import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { compressImage, calculateCompressionQuality, compressImageToTargetSize } from "@/lib/compression"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { writeFile, mkdir, rm } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_COMPRESSIONS = 10

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await getUsageToday(user.userId)
    if (usage && usage.compressions_used >= MAX_DAILY_COMPRESSIONS) {
      return NextResponse.json(
        { error: `Daily compression limit (${MAX_DAILY_COMPRESSIONS}) reached` },
        { status: 429 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const mode = (formData.get("mode") as string) || "preset"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const inputFile = join(UPLOAD_DIR, `input-${Date.now()}.tmp`)
    const outputFile = join(UPLOAD_DIR, `compressed-${Date.now()}-${file.name}`)

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(inputFile, buffer)

    let result

    if (mode === "target") {
      const targetKB = parseInt((formData.get("targetSizeKB") as string) || "500")
      result = await compressImageToTargetSize(inputFile, outputFile, targetKB * 1024)
    } else if (mode === "custom") {
      const qualityVal = parseInt((formData.get("qualityValue") as string) || "80")
      result = await compressImage(inputFile, outputFile, qualityVal)
    } else {
      const quality = (formData.get("quality") as string) || "medium"
      const compressionQuality = calculateCompressionQuality(quality as "low" | "medium" | "high")
      result = await compressImage(inputFile, outputFile, compressionQuality)
    }

    const { originalSize, compressedSize } = result

    try {
      await rm(inputFile)
    } catch (e) { }

    await createOrUpdateUsageTracking(user.userId, "compressions_used", 1)

    return NextResponse.json({
      originalSize,
      compressedSize,
      downloadUrl: `/uploads/${outputFile.split("/").pop()}`,
    })
  } catch (error) {
    console.error("Compression error:", error)
    return NextResponse.json({ error: "Compression failed" }, { status: 500 })
  }
}
