import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking } from "@/lib/db"
import { join } from "path"
import { mkdir, writeFile } from "fs/promises"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        const formData = await request.formData()
        const file = formData.get("file") as File
        const title = formData.get("title") as string
        const author = formData.get("author") as string
        const subject = formData.get("subject") as string
        const keywords = formData.get("keywords") as string // comma separated

        if (!file) {
            return NextResponse.json({ error: "File required" }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(buffer)

        if (title) pdfDoc.setTitle(title)
        if (author) pdfDoc.setAuthor(author)
        if (subject) pdfDoc.setSubject(subject)
        if (keywords) pdfDoc.setKeywords(keywords.split(",").map(k => k.trim()))

        // Also set Creator/Producer to "DocProcess" for branding
        pdfDoc.setProducer("DocProcess PDF Tools")
        pdfDoc.setCreator("DocProcess")

        const pdfBytes = await pdfDoc.save()
        const outputFilename = `metadata-${Date.now()}.pdf`
        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        if (user) await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Metadata error:", error)
        return NextResponse.json({ error: "Failed to update metadata" }, { status: 500 })
    }
}
