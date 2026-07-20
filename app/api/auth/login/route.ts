import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth/authUtils";
import { NextResponse } from "next/server";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email (case-insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true }
    });

    if (!user) {
      // Generic error message for security
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if this is a social login account (password is null)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login. Please sign in using your provider." },
        { status: 400 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Generate JWT token with payload object
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name
    });


    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });


    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role.name
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}