import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/routeHandler";
import { z } from "zod";

// Validation schema
const librarySchema = z.object({
  game_id: z.number().int()
});

// POST handler - add a game to user's library
export const POST = withAuth(async (
  req: Request,
  user: { userId: number; email: string; role: string }
) => {
  try {
    const body = await req.json();
    const validation = librarySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { game_id } = validation.data;

    // Verify the game exists
    const game = await prisma.game.findUnique({
      where: { id: game_id }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if the game is already in the user's library
    const existingEntry = await prisma.savedGame.findFirst({
      where: {
        user_id: user.userId,
        game_id
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Game already in library" },
        { status: 400 }
      );
    }

    // Add the game to the user's library
    await prisma.savedGame.create({
      data: {
        user_id: user.userId,
        game_id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding game to library:", error);
    return NextResponse.json(
      { error: "Internal server error while adding game to library" },
      { status: 500 }
    );
  }
});

// DELETE handler - remove a game from user's library
export const DELETE = withAuth(async (
  req: Request,
  user: { userId: number; email: string; role: string }
) => {
  try {
    const body = await req.json();
    const validation = librarySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { game_id } = validation.data;

    // Remove the game from the user's library
    await prisma.savedGame.deleteMany({
      where: {
        user_id: user.userId,
        game_id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error removing game from library:", error);
    return NextResponse.json(
      { error: "Internal server error while removing game from library" },
      { status: 500 }
    );
  }
});