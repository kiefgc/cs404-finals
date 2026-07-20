import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * POST /api/admin/make-admin
 * Promotes a user to ADMIN role
 *
 * Requires: Authenticated ADMIN user
 * Body: { targetId: number }
 * Returns: { success: true } | { error: string }
 *
 * Revalidates dashboard-admin and dashboard-user cache tags
 */
export async function POST(request: Request) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true },
    });

    if (!user || user.role.name !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const targetId = body.targetId;

    if (!targetId || typeof targetId !== "number") {
      return NextResponse.json({ error: "Invalid targetId" }, { status: 400 });
    }

    // Prevent self-promotion (optional but safe)
    if (targetId === session.userId) {
      return NextResponse.json({ error: "Cannot promote yourself" }, { status: 400 });
    }

    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
      return NextResponse.json({ error: "Admin role not found" }, { status: 500 });
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { role_id: adminRole.id },
    });

    revalidateTag("dashboard-admin", {});
    revalidateTag("dashboard-user", {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Make admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}