import { withAuth } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = withAuth(
  async (
    req: Request,
    user: { userId: number; email: string; role: string },
    // Pass the Next.js parameters block as the second parameter
    context?: { params: Promise<{ id: string }> },
  ) => {
    // Fallback checks just in case the context wasn't passed cleanly by the wrapper
    let reviewId: number;

    if (context?.params) {
      const { id } = await context.params;
      reviewId = parseInt(id);
    } else {
      // Fallback parsing only if the wrapping function doesn't pass downstream context
      const url = new URL(req.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const reviewsIndex = segments.indexOf("reviews");
      reviewId = parseInt(segments[reviewsIndex + 1] || "");
    }

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID." },
        { status: 400 },
      );
    }

    try {
      // 1. Check if the review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found." },
          { status: 404 },
        );
      }

      // 2. Check if the like already exists
      const existingLike = await prisma.like.findUnique({
        where: {
          user_id_review_id: {
            user_id: user.userId,
            review_id: reviewId,
          },
        },
      });

      let liked = false;
      if (existingLike) {
        // Remove the like
        await prisma.like.delete({
          where: {
            user_id_review_id: {
              user_id: user.userId,
              review_id: reviewId,
            },
          },
        });
      } else {
        // Add the like
        await prisma.like.create({
          data: {
            user_id: user.userId,
            review_id: reviewId,
          },
        });
        liked = true;
      }

      // 3. Get the updated like count
      const likeCount = await prisma.like.count({
        where: { review_id: reviewId },
      });

      return NextResponse.json({
        success: true,
        liked,
        likes_count: likeCount,
      });
    } catch (error) {
      console.error("Error toggling review like:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
