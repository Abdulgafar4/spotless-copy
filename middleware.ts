import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/" ||
    path === "/about-us" ||
    path === "/faq"

  // Check if user is authenticated by looking for the auth token
  const token = request.cookies.get("auth-token")?.value

  // Check if path is admin route
  const isAdminPath = path.startsWith("/admin")

  // Check if user is admin (in a real app, this would be a proper check)
  const isAdmin = request.cookies.get("role")?.value === "admin"

  // If trying to access admin routes without admin privileges
  if (isAdminPath && (!token || !isAdmin)) {
    // Redirect to login with a message
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("message", "You must be an admin to access this page")
    return NextResponse.redirect(loginUrl)
  }

  // If the path requires authentication and user is not authenticated
  if (!isPublicPath && !token) {
    // Create the URL for the login page with a redirect parameter
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", path)

    // Redirect to login
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login/signup
  if (token && (path === "/login" || path === "/signup")) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/booking/:path*", "/booking", "/admin/:path*", "/login", "/signup"],
}

