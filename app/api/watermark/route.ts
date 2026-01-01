import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking } from "@/lib/db"
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
        const text = formData.get("text") as string
        const opacity = parseFloat(formData.get("opacity") as string) || 0.5
        const size = parseFloat(formData.get("size") as string) || 50
        const colorHex = (formData.get("color") as string) || "#000000"
        const rotation = parseFloat(formData.get("rotation") as string) || -45

        if (!file || !text) {
            return NextResponse.json({ error: "File and watermark text are required" }, { status: 400 })
        }

        // Convert Hex to RGB (pdf-lib uses 0-1 range)
        const r = parseInt(colorHex.slice(1, 3), 16) / 255
        const g = parseInt(colorHex.slice(3, 5), 16) / 255
        const b = parseInt(colorHex.slice(5, 7), 16) / 255

        const pdfBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfBuffer)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        const pages = pdfDoc.getPages()
        for (const page of pages) {
            const { width, height } = page.getSize()

            // Calculate center
            const textWidth = helveticaFont.widthOfTextAtSize(text, size)
            const textHeight = helveticaFont.heightAtSize(size)

            // Simple center placement for MVP
            // For tiling/grid, we'd need a nested loop. Let's stick to CENTER first.

            page.drawText(text, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                size: size,
                font: helveticaFont,
                color: rgb(r, g, b),
                opacity: opacity,
                rotate: degrees(rotation),
            })
        }

        const pdfBytes = await pdfDoc.save()
        const outputFilename = `watermarked-${Date.now()}.pdf`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Watermark error:", error)
        return NextResponse.json({ error: "Failed to apply watermark" }, { status: 500 })
    }
}
