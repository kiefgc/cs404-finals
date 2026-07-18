import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

// POST handler - save/unsave a game to user's library
export const POST = withAuth(async (
  req: Request,
  user: { userId: number; email: string; role: string },
  context?: { params: Promise<{ gameid: string }> }
) => {
  try {
    // Extract gameid from async params
    const { gameid } = context?.params ? await context.params : { gameid: '' };
    const gameId = parseInt(gameid);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID." }, { status: 400 });
    }

    // Check if the game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    // Check if the game is already saved
    const existingEntry = await prisma.savedGame.findUnique({
      where: {
        user_id_game_id: {
          user_id: user.userId,
          game_id: gameId
        }
      }
    });

    let saved = false;
    if (existingEntry) {
      // Remove from library
      await prisma.savedGame.delete({
        where: {
          user_id_game_id: {
            user_id: user.userId,
            game_id: gameId
          }
        }
      });
    } else {
      // Add to library
      await prisma.savedGame.create({
        data: {
          user_id: user.userId,
          game_id: gameId
        }
      });
      saved = true;
    }

    // Invalidate cache
    revalidateTag('games', {});
    revalidateTag('dashboard-user', {});

    return NextResponse.json({ success: true, saved });

  } catch (error) {
    console.error("Error toggling game save:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});