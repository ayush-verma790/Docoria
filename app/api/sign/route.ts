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

      // Embed all standard fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
      const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique)

      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman)
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
      const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic)

      const courier = await pdfDoc.embedFont(StandardFonts.Courier)
      const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold)
      const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique)
      const courierBoldOblique = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)

      // Hex to RGB helper
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255, // Fixed typo
          b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
      }

      for (const edit of textEdits) {
        const pageIndex = (edit.page || 1) - 1
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue

        const page = pdfDoc.getPage(pageIndex)
        const { height } = page.getSize()

        // Dynamic Coordinate Scaling:
        // Adjust coordinates if the client-side render size differed from the actual PDF point size.
        // This solves misalignment issues caused by browser DPI or PDF viewer scaling.
        const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize()
        let scaleX = 1
        let scaleY = 1
        if (edit.pageWidth && edit.pageHeight) {
          scaleX = pdfPageWidth / edit.pageWidth
          scaleY = pdfPageHeight / edit.pageHeight
        }

        // Apply Scaling
        const finalX = edit.x * scaleX
        const finalY = edit.y * scaleY
        const finalWidth = edit.width * scaleX
        const finalHeight = edit.height * scaleY

        // --- Approach 1: Full PDF Object Rewriting ---
        // Attempt to "delete" the object from the stream if possible
        if (edit.originalText && edit.originalText.length > 3) {
          try {
            // @ts-ignore
            const { Contents } = page.node.normalizedEntries()
            if (Contents) {
              Contents.asArray().forEach((streamRef: any) => {
                const stream = pdfDoc.context.lookup(streamRef) as any
                if (stream) {
                  let contentString = ""
                  const buffer = stream.getContents()
                  for (let i = 0; i < buffer.length; i++) contentString += String.fromCharCode(buffer[i])

                  const safeText = edit.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const patternTJ = new RegExp(`\\(${safeText}\\)\\s*Tj`, 'g')

                  if (patternTJ.test(contentString)) {
                    contentString = contentString.replace(patternTJ, '() Tj')
                    stream.setContents(Buffer.from(contentString))
                  }
                }
              })
            }
          } catch (e) {
            console.log("Stream redaction failed:", e)
          }
        }

        // 1. "Visual Masking" (Safety Net)
        // Even if we "delete" the object, we draw a white box to ensure 100% visual coverage 
        // in case our stream pattern match failed (e.g. hex encoding).
        const pdfY = pdfPageHeight - finalY - finalHeight

        page.drawRectangle({
          x: finalX - 2,
          y: pdfY - 3,
          width: finalWidth + 4,
          height: finalHeight + 6,
          color: rgb(1, 1, 1),
        })

        // 2. Select Font based on Family + Weight + Style
        let isBold = false
        if (typeof edit.fontWeight === 'string') {
          isBold = edit.fontWeight === 'bold' || edit.fontWeight === '700' || edit.fontWeight === '800'
        } else if (typeof edit.fontWeight === 'number') {
          isBold = edit.fontWeight >= 700
        }

        let isItalic = edit.fontStyle === 'italic' || edit.fontStyle === 'oblique'

        let font = helvetica
        const family = (edit.fontFamily || '').toLowerCase()

        if (family.includes('times') || family.includes('serif')) {
          if (isBold && isItalic) font = timesBoldItalic
          else if (isBold) font = timesBold
          else if (isItalic) font = timesItalic
          else font = times
        } else if (family.includes('courier') || family.includes('mono')) {
          if (isBold && isItalic) font = courierBoldOblique
          else if (isBold) font = courierBold
          else if (isItalic) font = courierOblique
          else font = courier
        } else {
          // Default Sans / Helvetica
          if (isBold && isItalic) font = helveticaBoldOblique
          else if (isBold) font = helveticaBold
          else if (isItalic) font = helveticaOblique
          else font = helvetica
        }

        const fontSize = parseFloat(edit.fontSize) || 12
        const textColor = edit.color ? hexToRgb(edit.color) : { r: 0, g: 0, b: 0 }

        // Calculate text width for alignment
        const textWidth = font.widthOfTextAtSize(edit.text, fontSize)
        let drawX = finalX

        if (edit.align === 'center') {
          drawX = finalX + (finalWidth - textWidth) / 2
        } else if (edit.align === 'right') {
          drawX = finalX + finalWidth - textWidth
        }

        page.drawText(edit.text, {
          x: drawX,
          y: pdfY + (finalHeight * 0.2), // Slight baseline adjustment
          size: fontSize,
          font: font,
          color: rgb(textColor.r, textColor.g, textColor.b),
          maxWidth: finalWidth + 100
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
