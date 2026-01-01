import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export async function query(text: string, params?: any[]) {
  try {
    // For Neon, we need to use the sql function with proper parameter handling
    // Build a function that creates the proper SQL call
    let result

    if (params && params.length > 0) {
      // Replace $1, $2, etc. with actual values for the tagged template
      let processedText = text
      params.forEach((param, index) => {
        processedText = processedText.replace(`$${index + 1}`, `$${index + 1}`)
      })
      // Use sql.query for parameterized queries
      result = await sql.query(text, params)
    } else {
      // For simple queries without parameters
      result = await sql(text)
    }

    return result || []
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  const result = await sql.query("SELECT * FROM users WHERE email = $1", [email])
  return result[0] || null
}

export async function createUser(email: string, password_hash: string, full_name: string) {
  const result = await sql.query(
    "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name",
    [email, password_hash, full_name],
  )
  return result[0]
}

export async function getUserById(id: number) {
  const result = await sql.query("SELECT id, email, full_name, created_at FROM users WHERE id = $1", [id])
  return result[0] || null
}

export async function getDocumentsByUserId(userId: number) {
  const result = await sql.query("SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC", [userId])
  return result
}

export async function createDocument(
  userId: number,
  filename: string,
  fileType: string,
  originalSize: number,
  filePath: string,
) {
  const result = await sql.query(
    "INSERT INTO documents (user_id, original_filename, file_type, original_size, file_path) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [userId, filename, fileType, originalSize, filePath],
  )
  return result[0]
}

export async function updateDocument(documentId: number, updates: any) {
  const setClause = Object.keys(updates)
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(", ")
  const values = [...Object.values(updates), documentId]
  const result = await sql.query(
    `UPDATE documents SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${Object.keys(updates).length + 1} RETURNING *`,
    values,
  )
  return result[0]
}

export async function updateDocumentStatus(documentId: number, status: string) {
  const result = await sql.query(
    "UPDATE documents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [status, documentId],
  )
  return result[0]
}

export async function getUsageToday(userId: number) {
  const result = await sql.query("SELECT * FROM usage_tracking WHERE user_id = $1 AND date = CURRENT_DATE", [userId])
  return result[0] || null
}

export async function createOrUpdateUsageTracking(userId: number, field: string, value: number) {
  const existing = await getUsageToday(userId)
  if (existing) {
    const result = await sql.query(
      `UPDATE usage_tracking SET ${field} = ${field} + $1 WHERE user_id = $2 AND date = CURRENT_DATE RETURNING *`,
      [value, userId],
    )
    return result[0]
  } else {
    const result = await sql.query(`INSERT INTO usage_tracking (user_id, ${field}) VALUES ($1, $2) RETURNING *`, [
      userId,
      value,
    ])
    return result[0]
  }
}

export async function createSharedLink(
  documentId: number,
  allowDownload: boolean,
  viewOnly: boolean,
  expiresAt?: Date,
) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const result = await sql.query(
    "INSERT INTO shared_links (document_id, token, allow_download, view_only, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [documentId, token, allowDownload, viewOnly, expiresAt || null],
  )
  return result[0]
}

export async function getSharedLinkByToken(token: string) {
  const result = await sql.query("SELECT * FROM shared_links WHERE token = $1", [token])
  return result[0] || null
}

export async function getDocumentById(id: number) {
  const result = await sql.query("SELECT * FROM documents WHERE id = $1", [id])
  return result[0] || null
}

export async function initializeDatabase() {
  try {
    await sql.query("SELECT 1 FROM users LIMIT 1")
    return true
  } catch (error) {
    console.error("[v0] Database not initialized:", error)
    return false
  }
}

// Add a function to get current user ID from request
export async function getCurrentUserIdFromAuth(): Promise<number | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return null

    const { verifyToken } = await import("@/lib/auth")
    const verified = await verifyToken(token)
    return verified?.userId || null
  } catch (error) {
    return null
  }
}
