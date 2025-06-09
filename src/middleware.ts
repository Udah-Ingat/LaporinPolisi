import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET;

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/create", "/settings", "/admin"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Admin only routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if accessing admin route without admin privileges
  if (isAdminRoute && (!token?.isAdmin)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};