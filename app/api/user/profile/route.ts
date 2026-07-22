import { withAuth, withUserData } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

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

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  handle: z.string()
    .min(1, "Handle is required")
    .max(50, "Handle must be 50 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Handle can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().max(100, "Location must be 100 characters or less").optional(),
  profile_pic: z.string().url("Profile picture must be a valid URL").optional().or(z.literal("")),
});

export const PATCH = withAuth(async (req: Request, user) => {
  try {
    const body = await req.json();

    // Validate request body
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, handle, bio, location, profile_pic } = validation.data;

    // Check if handle is being changed and if it's already taken
    if (handle) {
      const existingUser = await prisma.user.findUnique({
        where: { handle }
      });

      if (existingUser && existingUser.id !== user.userId) {
        return NextResponse.json(
          { error: "This handle is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(handle !== undefined && { handle }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(profile_pic !== undefined && { profile_pic }),
      },
      include: {
        role: true,
        saved_games: {
          include: {
            game: true
          }
        }
      }
    });

    // Return updated profile data
    return NextResponse.json({
      user_id: updatedUser.id,
      name: updatedUser.name,
      handle: updatedUser.handle,
      role: updatedUser.role.name,
      bio: updatedUser.bio || "",
      location: updatedUser.location || "",
      joined: updatedUser.created_at ? `Joined ${updatedUser.created_at.toLocaleDateString()}` : "",
      profile_pic: updatedUser.profile_pic || "",
      gamesCount: updatedUser.saved_games.length,
      reviewsCount: await prisma.review.count({
        where: { user_id: user.userId }
      }),
      followersCount: 0,
      liked_games: updatedUser.saved_games.map((lib: { game_id: number }) => lib.game_id)
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
});