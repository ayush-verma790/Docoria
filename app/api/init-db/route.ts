import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const SQL_INIT = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(512),
  file_type VARCHAR(50),
  original_size INTEGER,
  compressed_size INTEGER,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_links (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  allow_download BOOLEAN DEFAULT TRUE,
  view_only BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  uploads_used INTEGER DEFAULT 0,
  compressions_used INTEGER DEFAULT 0,
  edits_used INTEGER DEFAULT 0,
  signatures_used INTEGER DEFAULT 0,
  conversions_used INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS signatures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signature_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(token);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, date);
`

export async function POST(request: NextRequest) {
  try {
    const statements = SQL_INIT.split(";").filter((s) => s.trim())

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement)
      }
    }

    return NextResponse.json({ success: true, message: "Database initialized" })
  } catch (error) {
    console.error("[v0] DB init error:", error)
    return NextResponse.json({ error: "Database initialization failed", details: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist
    const result = await sql.query("SELECT COUNT(*) FROM users")
    return NextResponse.json({ status: "ok", tables: "exist" })
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database not initialized" }, { status: 500 })
  }
}
