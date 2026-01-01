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
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const password = formData.get("password") as string

        if (!file || !password) {
            return NextResponse.json({ error: "File and password are required" }, { status: 400 })
        }

        const pdfBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfBuffer)

        // Encrypt the document with 128-bit AES (standard compatibility)
        // We set both user and owner password to the same for this simple MVP
        await pdfDoc.encrypt({
            userPassword: password,
            ownerPassword: password,
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
            },
        })

        const pdfBytes = await pdfDoc.save()
        const outputFilename = `protected-${Date.now()}.pdf`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Protect error:", error)
        return NextResponse.json({ error: "Failed to protect PDF" }, { status: 500 })
    }
}
