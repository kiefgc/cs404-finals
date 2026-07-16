import { NextResponse, type NextRequest } from 'next/server';
import { authGuard } from './lib/auth/authUtils';

const protectedRoutes = [
  '/profile',
  '/library',
  '/journal'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    // Verify authentication
    const user = await authGuard();

    // If not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
}