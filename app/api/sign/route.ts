import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_SIGNATURES = 10

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await getUsageToday(user.userId)
    if (usage && usage.signatures_used >= MAX_DAILY_SIGNATURES) {
      return NextResponse.json({ error: `Daily signature limit (${MAX_DAILY_SIGNATURES}) reached` }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const signatureData = formData.get("signature") as string
    const positionsJson = formData.get("positions") as string
    const textEditsJson = formData.get("textEdits") as string
    const pageOrderJson = formData.get("pageOrder") as string
    const rotationsJson = formData.get("rotations") as string

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    let pdfDoc = await PDFDocument.load(arrayBuffer)

    // --- Process Page Organization (Reorder & Rotate) ---
    if (pageOrderJson) {
      const pageOrder: number[] = JSON.parse(pageOrderJson)
      const rotations: Record<number, number> = rotationsJson ? JSON.parse(rotationsJson) : {}

      // Only process if order has changed or rotations exist
      const hasReordering = pageOrder.some((pageNum, index) => pageNum !== index + 1)
      const hasRotations = Object.keys(rotations).length > 0

      if (hasReordering || hasRotations) {
        const newPdfDoc = await PDFDocument.create()

        for (const originalPageNum of pageOrder) {
          const pageIndex = originalPageNum - 1
          if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex])

            // Apply rotation if specified
            const rotation = rotations[originalPageNum] || 0
            if (rotation !== 0) {
              copiedPage.setRotation(degrees(rotation))
            }

            newPdfDoc.addPage(copiedPage)
          }
        }

        pdfDoc = newPdfDoc
      }
    }


    // --- Process Text Edits ---
    if (textEditsJson) {
      const textEdits = JSON.parse(textEditsJson)
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      for (const edit of textEdits) {
        const pageIndex = (edit.page || 1) - 1
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue

        const page = pdfDoc.getPage(pageIndex)
        const { height } = page.getSize()

        // 1. "Erase" original text with white rectangle
        // Coordinates from frontend are Top-Left
        const pdfX = edit.x
        // Adjust Y for bottom-left origin
        const pdfY = height - edit.y - edit.height

        // Add some padding to cover fully
        page.drawRectangle({
          x: pdfX - 1,
          y: pdfY - 1,
          width: edit.width + 2,
          height: edit.height + 2,
          color: rgb(1, 1, 1), // White
        })

        // 2. Draw new text
        let font = helveticaFont
        if (edit.fontFamily) {
          const lower = edit.fontFamily.toLowerCase()
          if (lower.includes('times') || lower.includes('serif')) font = timesFont
          if (lower.includes('courier') || lower.includes('mono')) font = courierFont
          if (lower.includes('bold')) {
            if (font === timesFont) font = timesBoldFont
            else font = helveticaBoldFont
          }
        }

        // Parse font size "12px" -> 12
        const fontSize = parseFloat(edit.fontSize) || 12

        // Adjust Y back up for text baseline approximated
        // pdf-lib drawText y is baseline. HTML top-left y is top of box.
        // A rough approximation is y + height - fontSize + small_padding
        // Or usually simple: y + 2

        page.drawText(edit.text, {
          x: pdfX,
          y: pdfY + (edit.height * 0.2), // Basic baseline shift
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0), // Default black for now, could parse rgb from edit.color
          maxWidth: edit.width + 50 // Allow some expansion
        })
      }
    }

    // --- Process Signatures ---
    if (signatureData && signatureData !== "placeholder") {
      let signatureImage
      if (signatureData.startsWith("data:image/png")) {
        signatureImage = await pdfDoc.embedPng(signatureData)
      } else if (signatureData.startsWith("data:image/jpeg") || signatureData.startsWith("data:image/jpg")) {
        signatureImage = await pdfDoc.embedJpg(signatureData)
      }

      const positions = positionsJson ? JSON.parse(positionsJson) : []
      const applyToPages = positions.length > 0 ? positions : [] // Don't force sign if just editing text

      if (signatureImage && applyToPages.length > 0) {
        for (const pos of applyToPages) {
          const pageIndex = (pos.page || 1) - 1
          if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue

          const page = pdfDoc.getPage(pageIndex)
          const { height } = page.getSize()

          const sigDims = signatureImage.scale(0.5)
          const drawWidth = pos.width || sigDims.width
          const drawHeight = pos.height || sigDims.height

          const pdfX = pos.x
          const pdfY = height - pos.y - drawHeight

          page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY,
            width: drawWidth,
            height: drawHeight,
          })
        }
      }
    }

    const pdfBytes = await pdfDoc.save()
    const buffer = Buffer.from(pdfBytes)

    await mkdir(UPLOAD_DIR, { recursive: true })
    const filename = `signed-${Date.now()}-${file.name}`
    const filepath = join(UPLOAD_DIR, filename)

    await writeFile(filepath, buffer)

    await createOrUpdateUsageTracking(user.userId, "signatures_used", 1)

    return NextResponse.json({
      downloadUrl: `/uploads/${filename}`,
    })
  } catch (error) {
    console.error("Sign error:", error)
    return NextResponse.json({ error: "Signing failed: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
