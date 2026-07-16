import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Mock handler for Google OAuth callback
// In a real application, you would use the Google OAuth SDK and handle the actual callback
export async function GET(request: Request) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check for errors from Google
    if (error || !code) {
      return NextResponse.redirect(
        new URL('/login?error=google_auth_failed', request.url)
      );
    }

    // In a real application, you would:
    // 1. Use the code to exchange for an access token
    // 2. Fetch user info from Google
    // 3. Provision the user in your database
    // This is a mock implementation

    // Mock Google user data - replace with actual API call
    const googleUser = {
      id: `google_${Math.random().toString(36).substring(2, 15)}`,
      email: `user_${Math.random().toString(36).substring(2, 8)}@example.com`,
      name: "Google User",
      picture: ""
    };

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { supabase_id: googleUser.id },
      include: { role: true }
    });

    // If user doesn't exist, create them
    if (!user) {
      // Get the USER role
      const userRole = await prisma.role.findUnique({
        where: { name: "USER" }
      });

      if (!userRole) {
        return NextResponse.redirect(
          new URL('/login?error=system_config_error', request.url)
        );
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          supabase_id: googleUser.id, // Using this for Google ID
          name: googleUser.name,
          handle: `user_${Math.random().toString(36).substring(2, 8)}`,
          profile_pic: googleUser.picture,
          role_id: userRole.id
        },
        include: { role: true }
      });
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name
    });

    // Set cookie (await cookies())
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.redirect(
      new URL('/login?error=google_auth_error', request.url)
    );
  }
}