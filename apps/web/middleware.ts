import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/signup", "/auth/error"]

// Routes that should skip persona check (onboarding flow)
const onboardingRoutes = ["/persona", "/welcome"]

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isOnboardingRoute = onboardingRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to signin
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signin", nextUrl))
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === "/signin" || nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
