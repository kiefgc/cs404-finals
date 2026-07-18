import { withAuth } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const POST = withAuth(async (req, user) => {
  try {
    const { gameId } = await req.json();

    // Validate gameId
    if (!gameId || typeof gameId !== "number") {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    // Check if game exists
    const gameExists = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!gameExists) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if already in saved games
    const existingEntry = await prisma.savedGame.findFirst({
      where: {
        user_id: user.userId,
        game_id: gameId
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { success: true, message: "Game already saved" }
      );
    }

    // Add to saved games
    await prisma.savedGame.create({
      data: {
        user_id: user.userId,
        game_id: gameId
      }
    });

    // Invalidate cache
    revalidateTag('games', {});
    revalidateTag('dashboard-user', {});

    return NextResponse.json({
      success: true,
      gameId
    });

  } catch (error) {
    console.error("Add to library error:", error);
    return NextResponse.json(
      { error: "Failed to add game to library" },
      { status: 500 }
    );
  }
});