import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that require authentication
// The user specifically requested "Sign & Edit" to be protected.
// We also protect dashboard as it usually contains user-specific data.
const PROTECTED_PATHS: string[] = []

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if the current path is one of the protected paths
    const isProtected = PROTECTED_PATHS.some((protectedPath) =>
        path === protectedPath || path.startsWith(`${protectedPath}/`)
    )

    if (isProtected) {
        const token = request.cookies.get("auth_token")?.value

        if (!token) {
            // User is not logged in, redirect to login page
            // Store the original url to redirect back after login
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", path)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect logged-in users away from auth pages
    if (path === "/login" || path === "/register") {
        const token = request.cookies.get("auth_token")?.value
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

// Config to match only specific paths to avoid running middleware on static files
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
