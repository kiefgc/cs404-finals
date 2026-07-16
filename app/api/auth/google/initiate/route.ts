import { NextResponse } from "next/server";

// Mock Google OAuth initiate endpoint
// In a real application, redirect to Google's OAuth consent screen
export async function GET() {
  // In a real implementation, you would redirect to:
  // https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=profile+email&client_id=YOUR_CLIENT_ID...

  // For this mock implementation, redirect to our callback with a mock code
  const mockCallbackUrl = new URL(
    '/api/auth/google/callback',
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  );

  mockCallbackUrl.searchParams.set('code', 'mock_code_123');

  return NextResponse.redirect(mockCallbackUrl);
}