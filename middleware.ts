import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Check for local testing bypass cookie
  const isBypassed = request.cookies.has('auth-bypass')
  const isAuthenticated = !!token || isBypassed

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/study', '/planner', '/analytics', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  const authRoutes = ['/login', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
