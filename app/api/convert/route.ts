import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { imageToPDF } from "@/lib/compression"
import { createOrUpdateUsageTracking, getUsageToday } from "@/lib/db"
import { writeFile, mkdir, rm } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_DAILY_CONVERSIONS = 5

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await getUsageToday(user.userId)
    if (usage && usage.conversions_used >= MAX_DAILY_CONVERSIONS) {
      return NextResponse.json({ error: `Daily conversion limit (${MAX_DAILY_CONVERSIONS}) reached` }, { status: 429 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const convertType = formData.get("convertType") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    // Handle Text-based formats (TXT, MD, HTML) to PDF
    if (convertType === "pdf" && files.some(f => f.name.match(/\.(txt|md|html)$/i))) {
      const PDFDocument = require("pdfkit")
      const { createWriteStream } = require("fs")

      const file = files[0]
      let text = await file.text()

      // Basic HTML tag stripping if it's HTML
      if (file.name.endsWith('.html')) {
        text = text.replace(/<[^>]*>?/gm, '')
      }

      const outputFilename = `converted-${Date.now()}.pdf`
      const outputFile = join(UPLOAD_DIR, outputFilename)

      const doc = new PDFDocument()
      const stream = createWriteStream(outputFile)
      doc.pipe(stream)
      doc.fontSize(12).text(text, { align: 'left' })
      doc.end()

      await new Promise((resolve) => stream.on('finish', resolve))

      await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

      return NextResponse.json({
        downloadUrl: `/uploads/${outputFilename}`,
        filename: outputFilename,
      })
    }

    // Handle DOCX to PDF
    if (convertType === "pdf" && files.some(f => f.name.endsWith('.docx'))) {
      const mammoth = require("mammoth")
      const PDFDocument = require("pdfkit")
      const { createWriteStream } = require("fs")

      const file = files[0]
      const buffer = Buffer.from(await file.arrayBuffer())

      const result = await mammoth.extractRawText({ buffer })
      const text = result.value

      const outputFilename = `converted-${Date.now()}.pdf`
      const outputFile = join(UPLOAD_DIR, outputFilename)

      const doc = new PDFDocument()
      const stream = createWriteStream(outputFile)
      doc.pipe(stream)
      doc.fontSize(12).text(text || "No text content found in document.", {
        align: 'left'
      })
      doc.end()

      await new Promise((resolve) => stream.on('finish', resolve))
      await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

      return NextResponse.json({
        downloadUrl: `/uploads/${outputFilename}`,
        filename: outputFilename,
      })
    }

    // Handle PDF to DOCX
    if (convertType === "docx" && files.some(f => f.type === "application/pdf")) {
      const pdfParse = require("pdf-parse")
      const { Document, Packer, Paragraph, TextRun } = require("docx")

      const file = files[0]
      const buffer = Buffer.from(await file.arrayBuffer())

      try {
        const data = await pdfParse(buffer)
        const textContent = data.text

        // Create DOCX
        const doc = new Document({
          sections: [{
            properties: {},
            children: textContent.split('\n').map((line: string) =>
              new Paragraph({
                children: [new TextRun(line)],
              })
            ),
          }],
        })

        const outputFilename = `converted-${Date.now()}.docx`
        const outputFile = join(UPLOAD_DIR, outputFilename)

        const b64string = await Packer.toBase64String(doc)
        const docBuffer = Buffer.from(b64string, "base64")

        await writeFile(outputFile, docBuffer)
        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
          downloadUrl: `/uploads/${outputFilename}`,
          filename: outputFilename,
        })
      } catch (e) {
        console.error("PDF Parse Error:", e)
        return NextResponse.json({ error: "Failed to parse PDF content" }, { status: 500 })
      }
    }

    // Handle PDF to XLSX
    if (convertType === "xlsx" && files.some(f => f.type === "application/pdf")) {
      const pdfParse = require("pdf-parse")
      const XLSX = require("xlsx")

      const file = files[0]
      const buffer = Buffer.from(await file.arrayBuffer())

      try {
        const data = await pdfParse(buffer)
        const textContent = data.text
        const rows = textContent.split('\n').map((line: string) => [line])

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(rows)
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

        const outputFilename = `converted-${Date.now()}.xlsx`
        const outputFile = join(UPLOAD_DIR, outputFilename)
        XLSX.writeFile(wb, outputFile)

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
          downloadUrl: `/uploads/${outputFilename}`,
          filename: outputFilename,
        })
      } catch (e) {
        console.error("XLSX Error:", e)
        return NextResponse.json({ error: "Excel conversion failed" }, { status: 500 })
      }
    }

    // Handle PDF to PPTX
    if (convertType === "pptx" && files.some(f => f.type === "application/pdf")) {
      const pdfParse = require("pdf-parse")
      const PptxGenJS = require("pptxgenjs")

      const file = files[0]
      const buffer = Buffer.from(await file.arrayBuffer())

      try {
        const data = await pdfParse(buffer)
        const textContent = data.text

        const pres = new PptxGenJS()

        // Split text into slides (approx 1000 chars per slide for basic structure)
        const chunks = textContent.match(/[\s\S]{1,1500}/g) || [textContent]

        chunks.forEach((chunk: string) => {
          const slide = pres.addSlide()
          slide.addText(chunk, { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 12, color: '363636' })
        })

        const outputFilename = `converted-${Date.now()}.pptx`
        const outputFile = join(UPLOAD_DIR, outputFilename)
        await pres.writeFile({ fileName: outputFile })

        await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

        return NextResponse.json({
          downloadUrl: `/uploads/${outputFilename}`,
          filename: outputFilename,
        })
      } catch (e) {
        console.error("PPTX Error:", e)
        return NextResponse.json({ error: "PowerPoint conversion failed" }, { status: 500 })
      }
    }

    if (convertType === "pdf") {
      const tempFiles: string[] = []

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const tempFile = join(UPLOAD_DIR, `temp-${Date.now()}-${Math.random()}.tmp`)
        await writeFile(tempFile, buffer)
        tempFiles.push(tempFile)
      }

      const outputFile = join(UPLOAD_DIR, `converted-${Date.now()}.pdf`)
      await imageToPDF(tempFiles, outputFile)

      for (const tempFile of tempFiles) {
        try {
          await rm(tempFile)
        } catch (e) { }
      }

      await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

      return NextResponse.json({
        downloadUrl: `/uploads/${outputFile.split("/").pop()}`,
        filename: `converted-${Date.now()}.pdf`,
      })
    }

    // Handle Image conversions (png, jpg, jpeg, webp, avif, tiff, gif, bmp)
    const validImageFormats = ["png", "jpg", "jpeg", "webp", "avif", "tiff", "gif", "bmp"];
    if (validImageFormats.includes(convertType)) {
      const file = files[0]
      const buffer = Buffer.from(await file.arrayBuffer())
      const extension = convertType === "jpeg" ? "jpg" : convertType
      const outputFilename = `converted-${Date.now()}.${extension}`
      const outputFile = join(UPLOAD_DIR, outputFilename)

      const sharp = require("sharp")
      const image = sharp(buffer)

      switch (convertType) {
        case "png": await image.png().toFile(outputFile); break;
        case "jpg":
        case "jpeg": await image.jpeg().toFile(outputFile); break;
        case "webp": await image.webp().toFile(outputFile); break;
        case "avif": await image.avif().toFile(outputFile); break;
        case "tiff": await image.tiff().toFile(outputFile); break;
        case "gif": await image.gif().toFile(outputFile); break;
        case "bmp": await image.bmp().toFile(outputFile); break;
      }

      await createOrUpdateUsageTracking(user.userId, "conversions_used", 1)

      return NextResponse.json({
        downloadUrl: `/uploads/${outputFilename}`,
        filename: outputFilename,
      })
    }

    return NextResponse.json({ error: "Invalid conversion type or file format" }, { status: 400 })
  } catch (error) {
    console.error("Conversion error:", error)
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 })
  }
}
