/**
 * Comprehensive backend testing script for DocProcess MVP
 * Tests all API endpoints and core functionality
 */

const API_BASE = "http://localhost:3000/api"

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✓ ${name}`)
  } catch (error) {
    results.push({ name, passed: false, error: String(error) })
    console.error(`✗ ${name}: ${error}`)
  }
}

// Test database health
await test("Database Health Check", async () => {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (data.status !== "ok") throw new Error("Health check failed")
})

// Test DB initialization
await test("Database Initialization", async () => {
  const res = await fetch(`${API_BASE}/init-db`, { method: "POST" })
  if (!res.ok) throw new Error(`Status ${res.status}`)
})

// Test registration
let userId: number
let authToken: string

await test("User Registration", async () => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test User",
      email: "test@example.com",
      password: "testpass123",
    }),
  })
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (!data.user?.id) throw new Error("No user ID returned")
  userId = data.user.id
})

// Test login
await test("User Login", async () => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "testpass123",
    }),
  })
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (!data.user?.id) throw new Error("Login failed")
})

// Test file upload
let documentId: number

await test("File Upload", async () => {
  const formData = new FormData()
  // Create a simple test file
  const testContent = "Test document content"
  const blob = new Blob([testContent], { type: "application/pdf" })
  const file = new File([blob], "test.pdf", { type: "application/pdf" })
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Status ${res.status}: ${error.error}`)
  }
  const data = await res.json()
  if (!data.document?.id) throw new Error("No document ID returned")
  documentId = data.document.id
})

// Test document retrieval
await test("Get Documents", async () => {
  const res = await fetch(`${API_BASE}/documents`)
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error("Expected array of documents")
})

// Test usage tracking
await test("Get Usage Tracking", async () => {
  const res = await fetch(`${API_BASE}/usage`)
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (typeof data !== "object") throw new Error("Expected object")
})

// Test share link creation
let shareToken: string

await test("Create Share Link", async () => {
  const res = await fetch(`${API_BASE}/documents/${documentId}/share`, { method: "POST" })
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (!data.token) throw new Error("No token returned")
  shareToken = data.token
})

// Test share link retrieval
await test("Get Share Link", async () => {
  const res = await fetch(`${API_BASE}/share/${shareToken}`)
  if (!res.ok) throw new Error(`Status ${res.status}`)
  const data = await res.json()
  if (!data.filename) throw new Error("No filename in response")
})

// Test logout
await test("User Logout", async () => {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: "POST" })
  if (!res.ok) throw new Error(`Status ${res.status}`)
})

// Print summary
console.log("\n" + "=".repeat(50))
const passed = results.filter((r) => r.passed).length
const total = results.length
console.log(`Test Results: ${passed}/${total} passed`)

if (passed === total) {
  console.log("✓ All tests passed! MVP is ready.")
} else {
  console.log("✗ Some tests failed. Check errors above.")
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`)
    })
}
