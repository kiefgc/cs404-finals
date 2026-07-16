// "use server";

import { authGuard } from "./authUtils";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Creates a protected route handler that verifies authentication
 * and optionally checks for specific roles
 *
 * @param handler The route handler function
 * @param requiredRoles Array of required roles (defaults to ["USER", "ADMIN"])
 * @returns Protected route handler
 */
export function withAuth<
  T extends Record<string, string> = Record<string, string>
>(
  handler: (
    req: Request,
    user: { userId: number; email: string; role: string },
    context?: { params: Promise<T> }
  ) => Promise<NextResponse | Response>,
  requiredRoles: string[] = ["USER", "ADMIN"],
) {
  return async (req: Request, context?: { params: Promise<T> }) => {
    try {
      // Verify authentication
      const user = await authGuard(requiredRoles);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Call the handler with the authenticated user and context (including params)
      return await handler(req, user, context);
    } catch (error) {
      console.error("Protected route error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

/**
 * Creates a protected API route that returns user-specific data
 *
 * @param handler Function that returns data based on authenticated user
 * @param requiredRoles Array of required roles
 * @returns Protected data handler
 */
export function withUserData<T>(
  handler: (user: {
    userId: number;
    email: string;
    role: string;
  }) => Promise<T>,
  requiredRoles: string[] = ["USER", "ADMIN"],
) {
  return async () => {
    try {
      // Verify authentication
      const user = await authGuard(requiredRoles);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get and return the data
      const data = await handler(user);
      return NextResponse.json(data);
    } catch (error) {
      console.error("User data fetch error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
