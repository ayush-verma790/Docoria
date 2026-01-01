import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    await sql.query("SELECT 1")
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return NextResponse.json({ status: "error", message: "Database connection failed" }, { status: 500 })
  }
}
