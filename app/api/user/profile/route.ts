import { withUserData } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";

export const GET = withUserData(async (user) => {
  // Get user profile data including saved games
  const profileData = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      role: true,
      saved_games: {
        include: {
          game: true
        }
      }
    }
  });

  if (!profileData) {
    throw new Error("User not found");
  }

  // Transform the data to match frontend expectations
  return {
    user_id: profileData.id,
    name: profileData.name,
    handle: profileData.handle,
    role: profileData.role.name,
    bio: profileData.bio || "",
    location: profileData.location || "",
    joined: profileData.created_at ? `Joined ${profileData.created_at.toLocaleDateString()}` : "",
    profile_pic: profileData.profile_pic || "",
    gamesCount: profileData.saved_games.length,
    reviewsCount: await prisma.review.count({
      where: { user_id: user.userId }
    }),
    followersCount: 0, // Not implemented in this schema
    liked_games: profileData.saved_games.map((lib: { game_id: number }) => lib.game_id)
  };
});