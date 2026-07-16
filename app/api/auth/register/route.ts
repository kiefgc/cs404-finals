"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth/authUtils";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
  handle: z.string().min(2, "Handle must be at least 2 characters long"),
  bio: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, handle, bio, location } = validation.data;

    // Check if email or handle is already taken (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { handle: handle.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or Handle is already taken." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get the USER role
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" }
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "System configuration error: USER role not found." },
        { status: 500 }
      );
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        handle: handle.toLowerCase(),
        bio,
        location,
        role_id: userRole.id,
        profile_pic: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        supabase_id: "local-" + crypto.randomUUID(),
      },
      include: { role: true }
    });

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}