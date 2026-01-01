import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { join } from "path"
import { mkdir, writeFile } from "fs/promises"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_MERGES = 5

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const usage = await getUsageToday(user.userId)
        if (usage && usage.conversions_used >= MAX_DAILY_MERGES) { // Reusing conversion limit for now or create new
            // Ideally we should track merges separately, but for MVP we can group or just check total actions
        }

        const formData = await request.formData()
        const files = formData.getAll("files") as File[]

        if (!files || files.length < 2) {
            return NextResponse.json({ error: "Please provide at least 2 PDF files to merge" }, { status: 400 })
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create()

        for (const file of files) {
            if (file.type !== "application/pdf") {
                return NextResponse.json({ error: "Only PDF files are supported for merging" }, { status: 400 })
            }

            const fileBuffer = await file.arrayBuffer()
            const pdf = await PDFDocument.load(fileBuffer)
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
            copiedPages.forEach((page) => mergedPdf.addPage(page))
        }

        const modifiedPdfBytes = await mergedPdf.save()
        const outputFilename = `merged-${Date.now()}.pdf`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), modifiedPdfBytes)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1) // count as usage

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Merge error:", error)
        return NextResponse.json({ error: "Failed to merge PDFs" }, { status: 500 })
    }
}
