import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * DELETE /api/admin/delete-review
 * Soft-deletes (archives) a review
 *
 * Requires: Authenticated ADMIN user
 * Body: { targetId: number }
 * Returns: { success: true } | { error: string }
 *
 * Revalidates dashboard-reviews, dashboard-admin, and dashboard-user cache tags.
 */
export async function DELETE(request: Request) {
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

    await prisma.review.delete({ where: { id: targetId } });

    revalidateTag("dashboard-reviews", {});
    revalidateTag("dashboard-admin", {});
    revalidateTag("dashboard-user", {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}