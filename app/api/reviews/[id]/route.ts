import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/routeHandler";
import { z } from "zod";
import { revalidateTag } from "next/cache";

// Validation schema for partial reviews updates
const updateReviewSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  body: z.string().min(1).optional(),
  rating: z.number().min(1).max(10).optional(), // Strict 1-10 scale
  recommended: z.boolean().optional(),
});

// Helper function to fetch review by ID
async function getReviewById(reviewId: number) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
    },
  });
  return review;
}

// GET handler - fetches a single review respecting soft-delete
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await context.params;
    const reviewId = parseInt(resolvedParams.id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
        is_archived: false, // Respect soft-delete
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            profile_pic: true,
            role: { select: { name: true } },
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            cover_image: true,
            release_date: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Format the response
    const formattedReview = {
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      recommended: review.recommended,
      created_at: review.created_at,
      updated_at: review.updated_at,
      is_archived: review.is_archived,
      user: {
        id: review.user.id,
        name: review.user.name,
        handle: review.user.handle,
        profile_pic: review.user.profile_pic,
        role: review.user.role.name,
      },
      game: {
        id: review.game.id,
        title: review.game.title,
        cover_image: review.game.cover_image,
        release_date: review.game.release_date,
      },
      likes_count: review._count.likes,
      liked_by_current_user: false, // Will be set by frontend
    };

    return NextResponse.json({ review: formattedReview });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching review" },
      { status: 500 },
    );
  }
}

// Higher-Order Component wrapper for protected PATCH handler
export const PATCH = withAuth(
  async (
    req: Request,
    user: { userId: number; email: string; role: string },
  ) => {
    try {
      // Extract reviewId from URL
      const { pathname } = new URL(req.url);
      const reviewId = parseInt(pathname.split("/").pop() || "");

      if (isNaN(reviewId)) {
        return NextResponse.json(
          { error: "Invalid review ID" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const validation = updateReviewSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 },
        );
      }

      // Check if review exists
      const review = await getReviewById(reviewId);
      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 },
        );
      }

      // Check permissions
      const isAdmin = user.role === "ADMIN";
      const isOwner = review.user_id === user.userId;

      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: "Forbidden - insufficient permissions" },
          { status: 403 },
        );
      }

      // Non-admin users cannot edit archived reviews
      if (!isAdmin && review.is_archived) {
        return NextResponse.json(
          { error: "Cannot update an archived review" },
          { status: 400 },
        );
      }

      // Update the review
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: validation.data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              profile_pic: true,
              role: { select: { name: true } },
            },
          },
          _count: {
            select: { likes: true },
          },
        },
      });

      // Format the response
      const formattedReview = {
        id: updatedReview.id,
        title: updatedReview.title,
        body: updatedReview.body,
        rating: updatedReview.rating,
        recommended: updatedReview.recommended,
        created_at: updatedReview.created_at,
        updated_at: updatedReview.updated_at,
        is_archived: updatedReview.is_archived,
        user: {
          id: updatedReview.user.id,
          name: updatedReview.user.name,
          handle: updatedReview.user.handle,
          profile_pic: updatedReview.user.profile_pic,
          role: updatedReview.user.role.name,
        },
        likes_count: updatedReview._count.likes,
      };

      return NextResponse.json({ review: formattedReview });
    } catch (error) {
      console.error("Error updating review:", error);
      return NextResponse.json(
        { error: "Internal server error while updating review" },
        { status: 500 },
      );
    }
  },
);

// Invalidate reviews cache on review update
export async function PUT(req: Request) {
  revalidateTag('reviews', {});
  return NextResponse.json({ success: true });
}

// Higher-Order Component wrapper for protected DELETE handler
export const DELETE = withAuth(
  async (
    req: Request,
    user: { userId: number; email: string; role: string },
  ) => {
    try {
      // Extract reviewId from URL
      const { pathname } = new URL(req.url);
      const reviewId = parseInt(pathname.split("/").pop() || "");

      if (isNaN(reviewId)) {
        return NextResponse.json(
          { error: "Invalid review ID" },
          { status: 400 },
        );
      }

      // Check if review exists
      const review = await getReviewById(reviewId);
      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 },
        );
      }

      // Check permissions (admin OR owner)
      const isAdmin = user.role === "ADMIN";
      const isOwner = review.user_id === user.userId;

      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: "Forbidden - insufficient permissions" },
          { status: 403 },
        );
      }

      // Soft-delete the review
      await prisma.review.update({
        where: { id: reviewId },
        data: { is_archived: true },
      });

      // Invalidate cache
      revalidateTag('reviews', {});

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting review:", error);
      return NextResponse.json(
        { error: "Internal server error while deleting review" },
        { status: 500 },
      );
    }
  },
);
