import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/routeHandler";
import { z } from "zod";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Validation schema for the reviews feed
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(20).optional().default(6),
  cursor: z.string().optional(), // Cursor-based pagination
  game: z.string().optional(),
  user: z.coerce.number().optional(),
  sort: z.enum(["recent", "rating", "popular"]).optional().default("recent"),
  userId: z.coerce.number().optional(), // Current user ID for like status
});

// Validation schema for creating reviews
const createReviewSchema = z.object({
  game_id: z.number().int(),
  title: z.string().min(1).max(100),
  body: z.string().min(1),
  rating: z.number().min(1).max(10), // Strict 1-10 scale
  recommended: z.boolean().default(true),
});

// Cached query function - keyed by query parameters
const getReviewsCached = unstable_cache(
  async (
    limit: number,
    cursor: string | undefined,
    game: string | undefined,
    user: number | undefined,
    sort: string,
    userId: number | undefined,
  ) => {
    const whereClause: any = { is_archived: false };

    if (game) {
      whereClause.game = {
        title: { contains: game, mode: "insensitive" },
      };
    }

    if (user) {
      whereClause.user_id = user;
    }

    let orderByClause: any;

    switch (sort) {
      case "rating":
        orderByClause = { rating: "desc" };
        break;
      case "popular":
        orderByClause = { likes: { _count: "desc" } };
        break;
      case "recent":
      default:
        orderByClause = { created_at: "desc" };
        break;
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit + 1, // Take one extra to check if there's more
      cursor: cursor ? { id: Number(cursor) } : undefined,
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

    // Check if there's a next page
    let nextCursor: string | undefined = undefined;
    if (reviews.length > limit) {
      const nextReview = reviews.pop(); // Remove the extra item
      if (nextReview) {
        nextCursor = nextReview.id.toString();
      }
    }

    // Fetch liked status for current user if authenticated
    let likedReviewIds = new Set<number>();
    if (userId) {
      const likes = await prisma.like.findMany({
        where: {
          user_id: userId,
          review_id: {
            in: reviews.map((r) => r.id),
          },
        },
        select: {
          review_id: true,
        },
      });
      likedReviewIds = new Set(likes.map((l) => l.review_id));
    }

    return {
      reviews: reviews.map((review) => ({
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
        liked_by_current_user: likedReviewIds.has(review.id),
      })),
      nextCursor,
    };
  },
  ["reviews-feed"],
  { tags: ["reviews"], revalidate: 60 },
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = querySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { limit, cursor, game, user, sort, userId } = validation.data;

    const result = await getReviewsCached(
      limit,
      cursor,
      game,
      user,
      sort,
      userId,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching reviews." },
      { status: 500 },
    );
  }
}

// Higher-Order Component wrapper for protected POST handler
export const POST = withAuth(
  async (
    req: Request,
    user: { userId: number; email: string; role: string },
  ) => {
    try {
      const body = await req.json();
      const validation = createReviewSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 },
        );
      }

      // Verify the game exists
      const game = await prisma.game.findUnique({
        where: { id: validation.data.game_id },
      });

      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
      }

      // Check if user already reviewed this game
      const existingReview = await prisma.review.findFirst({
        where: {
          user_id: user.userId,
          game_id: validation.data.game_id,
          is_archived: false,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this game" },
          { status: 400 },
        );
      }

      // Create the review
      const review = await prisma.review.create({
        data: {
          game_id: validation.data.game_id,
          user_id: user.userId,
          title: validation.data.title,
          body: validation.data.body,
          rating: validation.data.rating,
          recommended: validation.data.recommended,
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

      // Invalidate reviews cache
      revalidateTag("reviews", {});

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
      };

      return NextResponse.json({ review: formattedReview }, { status: 201 });
    } catch (error) {
      console.error("Error creating review:", error);
      return NextResponse.json(
        { error: "Internal server error while creating review" },
        { status: 500 },
      );
    }
  },
);
