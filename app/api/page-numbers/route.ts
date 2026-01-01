import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
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
        const position = formData.get("position") as string || "bottom-center" // bottom-center, bottom-left, bottom-right

        if (!file) {
            return NextResponse.json({ error: "File required" }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(buffer)
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()
        const totalPages = pages.length

        pages.forEach((page, idx) => {
            const { width, height } = page.getSize()
            const text = `Page ${idx + 1} of ${totalPages}`
            const fontSize = 10
            const textWidth = font.widthOfTextAtSize(text, fontSize)

            let x = 0
            let y = 30 // Bottom margin

            if (position === "bottom-center") {
                x = width / 2 - textWidth / 2
            } else if (position === "bottom-right") {
                x = width - textWidth - 40
            } else {
                x = 40
            }

            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            })
        })

        const pdfBytes = await pdfDoc.save()
        const outputFilename = `numbered-${Date.now()}.pdf`
        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        if (user) await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Page number error:", error)
        return NextResponse.json({ error: "Failed to add page numbers" }, { status: 500 })
    }
}
