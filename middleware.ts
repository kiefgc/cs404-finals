import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/authUtils';

const protectedRoutes = [
  '/profile',
  '/library',
  '/journal'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if current route matches any protected prefix
  const isProtectedRoute = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    // 1. Extract cookie directly from NextRequest
    const authToken = request.cookies.get('auth_token')?.value;

    // 2. Direct verification without invoking next/headers
    const user = authToken ? await verifyToken(authToken) : null;


    // 3. Redirect to login if token is missing or invalid
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
};