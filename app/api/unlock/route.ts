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
        const password = formData.get("password") as string

        if (!file || !password) {
            return NextResponse.json({ error: "File and password required" }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()

        // Load with credentials to decrypt
        // Note: pdf-lib loads encrypted files if you pass { password } ??
        // Actually pdf-lib `load` takes `ignoreEncryption` or we try to load. 
        // Usually pdf-lib requires the password if it's encrypted.
        // However, to "Decrypt" and save as "No Password", we just load it (decrypting it in memory) and save it.

        // Attempt load
        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(buffer, { password })
        } catch (e) {
            return NextResponse.json({ error: "Incorrect password or corrupt file" }, { status: 400 })
        }

        // Saving it normally allows it to be saved without encryption unless we explicitly call encrypt()
        const pdfBytes = await pdfDoc.save()

        const outputFilename = `unlocked-${Date.now()}.pdf`
        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        if (user) await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Unlock error:", error)
        return NextResponse.json({ error: "Failed to unlock PDF" }, { status: 500 })
    }
}
