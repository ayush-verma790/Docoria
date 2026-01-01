const XLSX = require("xlsx")
const PptxGenJS = require("pptxgenjs")
const fs = require("fs")
const path = require("path")

async function test() {
    console.log("Testing XLSX...")
    try {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([["Test Line 1"], ["Test Line 2"]])
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        XLSX.writeFile(wb, "test.xlsx")
        console.log("XLSX written successfully")
    } catch (e) {
        console.error("XLSX failed:", e)
    }

    console.log("Testing PPTX...")
    try {
        const pres = new PptxGenJS()
        const slide = pres.addSlide()
        slide.addText("Hello World", { x: 1, y: 1, w: "80%", h: "80%" })
        await pres.writeFile({ fileName: "test.pptx" })
        console.log("PPTX written successfully")
    } catch (e) {
        console.error("PPTX failed:", e)
    }

    // Cleanup
    if (fs.existsSync("test.xlsx")) fs.unlinkSync("test.xlsx")
    if (fs.existsSync("test.pptx")) fs.unlinkSync("test.pptx")
}

test()
