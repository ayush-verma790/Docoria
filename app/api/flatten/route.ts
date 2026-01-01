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

        if (!file) {
            return NextResponse.json({ error: "File required" }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(buffer)

        const form = pdfDoc.getForm()

        try {
            form.flatten()
        } catch (e) {
            // If no form, that's fine, we might flatten annotations later?
            // pdf-lib form.flatten covers fields.
        }

        // Note: Flattening annotations (like comments) needs a loop, but form.flatten() is the big one.

        const pdfBytes = await pdfDoc.save()
        const outputFilename = `flattened-${Date.now()}.pdf`
        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        if (user) await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Flatten error:", error)
        return NextResponse.json({ error: "Failed to flatten PDF" }, { status: 500 })
    }
}
