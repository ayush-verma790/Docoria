import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUsageToday } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await getUsageToday(user.userId)
    return NextResponse.json(usage || {})
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
  }
}
