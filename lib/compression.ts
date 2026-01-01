import sharp from "sharp"
import PDFDocument from "pdfkit"
import { readFile, writeFile } from "fs/promises"

export async function compressImage(
  inputPath: string,
  outputPath: string,
  quality = 80,
): Promise<{ originalSize: number; compressedSize: number }> {
  try {
    const input = await readFile(inputPath)
    const originalSize = input.length

    const image = sharp(input)
    const metadata = await image.metadata()

    if (metadata.format === "jpeg" || metadata.format === "jpg") {
      await image.jpeg({ quality }).toFile(outputPath)
    } else if (metadata.format === "png") {
      await image.png({ quality: Math.round(quality / 100) }).toFile(outputPath)
    } else if (metadata.format === "webp") {
      await image.webp({ quality }).toFile(outputPath)
    } else {
      await writeFile(outputPath, input)
    }

    const output = await readFile(outputPath)
    const compressedSize = output.length

    return { originalSize, compressedSize }
  } catch (error) {
    console.error("[v0] Compression error:", error)
    throw error
  }
}

export async function resizeImage(inputPath: string, outputPath: string, width: number, height: number): Promise<void> {
  try {
    const input = await readFile(inputPath)
    await sharp(input).resize(width, height, { fit: "inside", withoutEnlargement: true }).toFile(outputPath)
  } catch (error) {
    console.error("[v0] Resize error:", error)
    throw error
  }
}

export async function imageToPDF(
  imagePaths: string[],
  outputPath: string,
): Promise<{ originalSize: number; pdfSize: number }> {
  try {
    let originalSize = 0
    const doc = new PDFDocument({ size: "A4" })

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i]
      const imageBuffer = await readFile(imagePath)
      originalSize += imageBuffer.length

      if (i > 0) doc.addPage()
      doc.image(imageBuffer, 0, 0, { width: 595, height: 842 })
    }

    await new Promise<void>((resolve, reject) => {
      const fs = require("fs")
      const stream = doc.pipe(fs.createWriteStream(outputPath))
      doc.end()
      stream.on("finish", resolve)
      stream.on("error", reject)
    })

    const pdfBuffer = await readFile(outputPath)
    const pdfSize = pdfBuffer.length

    return { originalSize, pdfSize }
  } catch (error) {
    console.error("[v0] Image to PDF conversion error:", error)
    throw error
  }
}

export function calculateCompressionQuality(level: "low" | "medium" | "high"): number {
  const qualityMap = {
    low: 95,
    medium: 75,
    high: 60,
  }
  return qualityMap[level]
}

export function getResizePresets(type: "a4" | "letter" | "custom" = "a4"): { width: number; height: number } {
  const presets = {

    a4: { width: 210, height: 297 },
    letter: { width: 216, height: 279 },
    custom: { width: 200, height: 200 },
  }
  return presets[type]
}

export async function compressImageToTargetSize(
  inputPath: string,
  outputPath: string,
  targetSizeBytes: number,
): Promise<{ originalSize: number; compressedSize: number }> {
  try {
    const input = await readFile(inputPath)
    const originalSize = input.length

    // Initial check - if already smaller, done (just ensure it's a valid image file by rewriting)
    if (originalSize <= targetSizeBytes) {
      await writeFile(outputPath, input)
      return { originalSize, compressedSize: originalSize }
    }

    let minQuality = 1
    let maxQuality = 100
    let bestQuality = 1
    let found = false

    // Binary search for the best quality
    for (let i = 0; i < 7; i++) {
      const midQuality = Math.floor((minQuality + maxQuality) / 2)

      // Use a temporary path for this iteration
      const tempPath = `${outputPath}.temp.${i}`

      await compressImage(inputPath, tempPath, midQuality)
      const tempBuffer = await readFile(tempPath)
      const tempSize = tempBuffer.length

      // Cleanup temp file
      const fs = require("fs/promises")
      await fs.unlink(tempPath)

      if (tempSize <= targetSizeBytes) {
        bestQuality = midQuality
        minQuality = midQuality + 1 // Try to get better quality
        found = true
      } else {
        maxQuality = midQuality - 1
      }
    }

    // Perform final compression with best found quality
    await compressImage(inputPath, outputPath, found ? bestQuality : 1) // If never found, use 1

    const output = await readFile(outputPath)

    return {
      originalSize,
      compressedSize: output.length
    }

  } catch (error) {
    console.error("[v0] Target size compression error:", error)
    throw error
  }
}
