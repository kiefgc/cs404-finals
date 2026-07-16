import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const querySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  sort: z.enum(["title", "release_date", "rating"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

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
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    // Title search
    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    // Genre filter
    if (genre) {
      whereClause.game_genres = {
        some: {
          genre: {
            name: genre
          }
        }
      };
    }

    // Build order by clause
    const orderByClause: any[] = [];

    if (sort === "title") {
      orderByClause.push({ title: order || "asc" });
    } else if (sort === "release_date") {
      orderByClause.push({ release_date: order || "desc" });
    } else if (sort === "rating") {
      orderByClause.push({ rating_avg: order || "desc" });
    } else {
      // Default sorting
      orderByClause.push({ title: "asc" });
    }

    // Query the database with pagination
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

    // Transform the genres structure for easier frontend consumption
    const formattedGames = games.map(game => ({
      ...game,
      genres: game.game_genres.map(g => g.genre.name)
    }));

    // Prepare response with pagination metadata
    const response = {
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

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching games." },
      { status: 500 }
    );
  }
}