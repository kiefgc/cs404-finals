"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/authUtils";

export async function toggleSaveGame(gameId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/games/${gameId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
    });

    const data = await res.json();
    return { success: res.ok, ...data };
  } catch (error) {
    console.error("Toggle save game error:", error);
    return { success: false, error: "Failed to save game" };
  }
}

export async function toggleLikeReview(reviewId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reviews/${reviewId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
    });

    const data = await res.json();
    return { success: res.ok, ...data };
  } catch (error) {
    console.error("Toggle like review error:", error);
    return { success: false, error: "Failed to like review" };
  }
}