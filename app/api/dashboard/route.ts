import { withAuth } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: Request, user: { userId: number; email: string; role: string }) => {
  try {
    if (user.role === "ADMIN") {
      // Admin dashboard metrics
      const [
        totalUsers,
        totalGames,
        totalReviews,
        activeReviews,
        archivedReviews,
        latestUsers,
        latestReviews,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.game.count(),
        prisma.review.count(),
        prisma.review.count({ where: { is_archived: false } }),
        prisma.review.count({ where: { is_archived: true } }),
        prisma.user.findMany({
          take: 5,
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            handle: true,
            created_at: true,
            role: { select: { name: true } },
          },
        }),
        prisma.review.findMany({
          take: 5,
          orderBy: { created_at: "desc" },
          include: {
            user: { select: { name: true, handle: true } },
            game: { select: { title: true } },
          },
        }),
      ]);

      return NextResponse.json({
        role: "ADMIN",
        metrics: {
          totalUsers,
          totalGames,
          totalReviews,
          activeReviews,
          archivedReviews,
          reviewArchivalRate: totalReviews > 0 ? (archivedReviews / totalReviews) * 100 : 0,
        },
        latestUsers,
        latestReviews,
      });
    } else {
      // User dashboard metrics
      const userProfile = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          role: true,
          saved_games: { include: { game: true } },
          reviews: true,
          // Explicit join-table queries: load Follow rows + related User on each side
          following: {
            include: { following: { select: { id: true, name: true, handle: true } } },
          },
          followers: {
            include: { follower: { select: { id: true, name: true, handle: true } } },
          },
        },
      });

      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const gamesCount = userProfile.saved_games.length;
      const reviewsCount = userProfile.reviews.length;
      const followersCount = userProfile.followers.length;
      const followingCount = userProfile.following.length;

      // Extract clean User[] arrays from the join-table rows
const followers = userProfile.followers.map((f: { follower: unknown }) => f.follower);
const following = userProfile.following.map((f: { following: unknown }) => f.following);

      // Recent reviews by this user
      const recentReviews = await prisma.review.findMany({
        where: { user_id: user.userId },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { game: { select: { title: true } } },
      });

      return NextResponse.json({
        role: "USER",
        profile: {
          id: userProfile.id,
          name: userProfile.name,
          handle: userProfile.handle,
          email: userProfile.email,
          bio: userProfile.bio,
          location: userProfile.location,
          profile_pic: userProfile.profile_pic,
          // Flatten Role object to flat string for frontend compatibility
          role: userProfile.role.name,
          created_at: userProfile.created_at,
        },
        metrics: {
          gamesCount,
          reviewsCount,
          followersCount,
          followingCount,
        },
        followers,
        following,
        recentReviews,
      });
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});