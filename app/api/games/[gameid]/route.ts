import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

interface GameGenreWithName {
  id: number;
  game_id: number;
  genre_id: number;
  genre: { id: number; name: string };
}

interface ReviewUser {
  id: number;
  name: string;
  handle: string;
  profile_pic: string | null;
  role: { id: number; name: string };
}

interface ReviewWithCounts {
  id: number;
  title: string;
  body: string;
  rating: number;
  recommended: boolean;
  created_at: Date;
  updated_at: Date;
  user: ReviewUser;
  _count: { likes: number };
}

interface GameWithRelations {
  id: number;
  title: string;
  description: string;
  release_date: string;
  cover_image: string | null;
  rating_avg: number;
  game_genres: GameGenreWithName[];
  reviews: ReviewWithCounts[];
  _count: {
    reviews: number;
    saved_by: number;
  };
}

// Cached function for base game data (without user-specific fields)
const getGameBaseData = unstable_cache(
  async (gameId: number): Promise<GameWithRelations | null> => {
    return prisma.game.findUnique({
      where: { id: gameId },
      include: {
        game_genres: {
          include: {
            genre: true,
          },
        },
        reviews: {
          where: { is_archived: false },
          orderBy: { created_at: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
                profile_pic: true,
                role: true,
              },
            },
            _count: {
              select: { likes: true },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            saved_by: true,
          },
        },
      },
    }) as Promise<GameWithRelations | null>;
  },
  ['game-detail'],
  { tags: ['game'], revalidate: 300 }
);

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ gameid: string }> },
) => {
  // 1. Check authentication safely via authGuard directly
  let currentUser: { userId: number; email: string; role: string } | null =
    null;
  try {
    currentUser = await authGuard(["USER", "ADMIN"]);
  } catch (error) {
    // If auth fails or user is a guest, let them proceed as null
    currentUser = null;
  }

  // 2. Resolve Next.js 15 dynamic parameters
  const { gameid } = await params;
  const gameId = parseInt(gameid);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    // 3. Fetch the cached base game data
    const game = await getGameBaseData(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // 4. Check if the current logged-in user has saved this game (NOT cached)
    let savedByCurrentUser = false;
    if (currentUser) {
      const savedGame = await prisma.savedGame.findUnique({
        where: {
          user_id_game_id: {
            user_id: currentUser.userId,
            game_id: gameId,
          },
        },
      });
      savedByCurrentUser = !!savedGame;
    }

    // 5. Format reviews with personal like status (NOT cached - user specific)
    const formattedReviews = await Promise.all(
      game.reviews.map(async (review) => {
        let likedByCurrentUser = false;
        if (currentUser) {
          const like = await prisma.like.findUnique({
            where: {
              user_id_review_id: {
                user_id: currentUser.userId,
                review_id: review.id,
              },
            },
          });
          likedByCurrentUser = !!like;
        }

        return {
          id: review.id,
          title: review.title,
          body: review.body,
          rating: review.rating,
          recommended: review.recommended,
          created_at: review.created_at,
          updated_at: review.updated_at,
          likes_count: review._count.likes,
          liked_by_current_user: likedByCurrentUser,
          user: {
            id: review.user.id,
            name: review.user.name,
            handle: review.user.handle,
            profile_pic: review.user.profile_pic,
          },
        };
      }),
    );

    // 6. Format the final response matching your original contract
    const response = {
      id: game.id,
      title: game.title,
      description: game.description,
      release_date: game.release_date,
      cover_image: game.cover_image,
      genres: game.game_genres.map((g) => g.genre.name),
      rating_avg: game.rating_avg,
      reviews_count: game._count.reviews,
      saves_count: game._count.saved_by,
      reviews: formattedReviews,
      saved_by_current_user: savedByCurrentUser,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching game." },
      { status: 500 },
    );
  }
};

// Note: Actual PATCH/DELETE handlers would go here and call revalidateTag('game')
// For now, cache invalidation should be done in the actual mutation endpoints
