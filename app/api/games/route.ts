import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

/**
 * Games List API Route
 *
 * GET  /api/games              - List games with search, filter, pagination (cached)
 * POST /api/games              - Create new game (admin only)
 *
 * The POST endpoint:
 * - Requires authenticated ADMIN user
 * - Validates input with Zod schema
 * - Creates game with genres
 * - Revalidates dashboard-admin, dashboard-user, and game cache tags
 */

// Validation schemas
const querySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  sort: z.enum(["title", "release_date", "rating"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const createGameSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  release_date: z.string().optional(),
  cover_image: z.string().url().optional(),
  genre_ids: z.array(z.number().int()).optional(),
  rating: z.number().min(1).max(10).optional(),
});

// Cached query function - keyed by search params
const getGamesCached = unstable_cache(
  async (search: string | undefined, genre: string | undefined, sort: string | undefined, order: string | undefined, page: number, limit: number) => {
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    if (genre) {
      whereClause.game_genres = {
        some: {
          genre: {
            name: genre
          }
        }
      };
    }

    const orderByClause: any[] = [];

    if (sort === "title") {
      orderByClause.push({ title: order || "asc" });
    } else if (sort === "release_date") {
      orderByClause.push({ release_date: order || "desc" });
    } else if (sort === "rating") {
      orderByClause.push({ rating_avg: order || "desc" });
    } else {
      orderByClause.push({ title: "asc" });
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limit,
        skip: offset,
        include: {
          game_genres: {
            include: {
              genre: true
            }
          }
        }
      }),
      prisma.game.count({ where: whereClause })
    ]);

    const formattedGames = games.map(game => ({
      ...game,
      genres: game.game_genres.map(g => g.genre.name)
    }));

    return {
      games: formattedGames,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1
      }
    };
  },
  ['games-list'],
  { tags: ['games'], revalidate: 60 }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = querySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { search, genre, sort, order, page, limit } = validation.data;

    const data = await getGamesCached(search, genre, sort, order, page, limit);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching games." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const validation = createGameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, release_date, cover_image, genre_ids, rating } = validation.data;

    const game = await prisma.game.create({
      data: {
        title,
        description,
        release_date: release_date ? new Date(release_date) : new Date(),
        cover_image,
        rating_avg: rating ?? undefined,
        game_genres: {
          create: genre_ids?.map(genre_id => ({
            genre: { connect: { id: genre_id } }
          })) || [],
        },
      },
      include: {
        game_genres: { include: { genre: true } }
      }
    });

    // Invalidate games cache
    revalidateTag("games", {});
    revalidateTag("dashboard-admin", {});
    revalidateTag("dashboard-user", {});

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Internal server error while creating game." },
      { status: 500 }
    );
  }
}