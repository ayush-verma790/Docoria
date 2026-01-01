import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, degrees } from "pdf-lib"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking } from "@/lib/db"
import { join } from "path"
import { mkdir, writeFile } from "fs/promises"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

interface PageItem {
    fileIndex: number
    pageIndex: number // 0-based
    rotation: number
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll("files") as File[]
        const sequenceJson = formData.get("sequence") as string

        if (!files || files.length === 0 || !sequenceJson) {
            return NextResponse.json({ error: "Files and sequence are required" }, { status: 400 })
        }

        const sequence = JSON.parse(sequenceJson) as PageItem[]

        // Load all source PDFs
        const sourceDocs: PDFDocument[] = []
        for (const file of files) {
            const buffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(buffer)
            sourceDocs.push(pdfDoc)
        }

        // Create new PDF
        const newPdf = await PDFDocument.create()

        // Process sequence
        for (const item of sequence) {
            if (item.fileIndex < 0 || item.fileIndex >= sourceDocs.length) continue

            const srcDoc = sourceDocs[item.fileIndex]

            // Copy page (handling indices)
            // copyPages takes an array of 0-based indices
            const [page] = await newPdf.copyPages(srcDoc, [item.pageIndex])

            // Apply rotation if needed (cumulative to existing rotation)
            const existingRotation = page.getRotation().angle
            const finalRotation = (existingRotation + item.rotation) % 360
            page.setRotation(degrees(finalRotation))

            newPdf.addPage(page)
        }

        const pdfBytes = await newPdf.save()
        const outputFilename = `merged-advanced-${Date.now()}.pdf`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, outputFilename), pdfBytes)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            filename: outputFilename
        })

    } catch (error) {
        console.error("Advanced merge error:", error)
        return NextResponse.json({ error: "Failed to merge PDFs" }, { status: 500 })
    }
}
