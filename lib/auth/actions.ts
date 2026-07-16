"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signToken } from "./authUtils"; // Adjust this path to where your authUtils file is located
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// --- Validation Schemas ---
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
  handle: z.string().min(2, "Handle must be at least 2 characters long"),
  bio: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// --- Actions ---
/**
 * 1. User Registration Action
 */
export async function registerUser(formData: FormData) {
  const rawFields = Object.fromEntries(formData.entries());

  // Validate fields with Zod
  const validation = registerSchema.safeParse(rawFields);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { email, password, name, handle, bio, location } = validation.data;

  try {
    // Check if email or handle is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { handle: handle.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return { success: false, error: "Email or Handle is already taken." };
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Fetch the default "USER" role ID
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" }
    });

    if (!userRole) {
      return { success: false, error: "System configuration error: Default role not found." };
    }

    // Create the user record in PostgreSQL
    // Note: Storing the password hash in supabase_id temporarily or adapting to your schema structure.
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        supabase_id: hashedPassword, // Using this column to hold our local secure hash as custom auth
        name,
        handle: handle.toLowerCase(),
        bio: bio || "",
        location: location || "",
        role_id: userRole.id
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Registration structural failure:", error);
    return { success: false, error: "An unexpected error occurred during registration." };
  }
}

/**
 * 2. User Login Action
 */
export async function loginUser(formData: FormData) {
  const rawFields = Object.fromEntries(formData.entries());

  const validation = loginSchema.safeParse(rawFields);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { email, password } = validation.data;

  try {
    // Find user by email and include their role relation
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true }
    });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify password matches the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.supabase_id);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password." };
    }

    // Generate custom stateless JWT payload
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name
    });

    // Await cookies store safely in Next.js 15+ App Router environment
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return { success: true };

  } catch (error) {
    console.error("Login verification failure:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}

/**
 * 3. User Logout Action
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  // Clear the token cookie
  cookieStore.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/"
  });

  redirect("/");
}