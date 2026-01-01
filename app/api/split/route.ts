import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { join } from "path"
import { mkdir, writeFile } from "fs/promises"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const pageIndicesStr = formData.get("pages") as string // e.g., "0,1,3"

        if (!file || !pageIndicesStr) {
            return NextResponse.json({ error: "File and pages are required" }, { status: 400 })
        }

        // Parse indices
        const pageIndices = pageIndicesStr.split(",").map(Number)

        const pdfBuffer = await file.arrayBuffer()
        const srcPdf = await PDFDocument.load(pdfBuffer)
        const newPdf = await PDFDocument.create()

        const copiedPages = await newPdf.copyPages(srcPdf, pageIndices)
        copiedPages.forEach((page) => newPdf.addPage(page))

        const pdfBytes = await newPdf.save()
        const outputFilename = `split-${Date.now()}.pdf`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Split error:", error)
        return NextResponse.json({ error: "Failed to split PDF" }, { status: 500 })
    }
}
