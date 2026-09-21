// ============================================================================
// Next.js Middleware
// Handles auth page redirection when active session cookie is present
// Client-side route protection is enforced by AuthGuard component
// ============================================================================
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_PAGES = ['/auth/sign-in', '/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    request.cookies.has('auth_session') ||
    request.cookies.has('__session');

  // If already signed in with active session cookie, avoid showing sign-in/sign-up
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
