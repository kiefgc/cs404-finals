import { withAuth } from "@/lib/auth/routeHandler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Cached admin dashboard data
const getAdminDashboardData = unstable_cache(
  async () => {
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

    return {
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
    };
  },
  ['admin-dashboard'],
  { tags: ['dashboard-admin'], revalidate: 60 }
);

// Cached user dashboard data (per user)
const getUserDashboardData = unstable_cache(
  async (userId: number) => {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        saved_games: { include: { game: true } },
        reviews: true,
        following: {
          include: { following: { select: { id: true, name: true, handle: true } } },
        },
        followers: {
          include: { follower: { select: { id: true, name: true, handle: true } } },
        },
      },
    });

    if (!userProfile) {
      return null;
    }

    const gamesCount = userProfile.saved_games.length;
    const reviewsCount = userProfile.reviews.length;
    const followersCount = userProfile.followers.length;
    const followingCount = userProfile.following.length;

    const followers = userProfile.followers.map((f: { follower: unknown }) => f.follower);
    const following = userProfile.following.map((f: { following: unknown }) => f.following);

    const recentReviews = await prisma.review.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 5,
      include: { game: { select: { title: true } } },
    });

    return {
      role: "USER",
      profile: {
        id: userProfile.id,
        name: userProfile.name,
        handle: userProfile.handle,
        email: userProfile.email,
        bio: userProfile.bio,
        location: userProfile.location,
        profile_pic: userProfile.profile_pic,
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
    };
  },
  ['user-dashboard'],
  { tags: ['dashboard-user'], revalidate: 60 }
);

export const GET = withAuth(async (req: Request, user: { userId: number; email: string; role: string }) => {
  try {
    if (user.role === "ADMIN") {
      const data = await getAdminDashboardData();
      return NextResponse.json(data);
    } else {
      const data = await getUserDashboardData(user.userId);
      if (!data) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// Invalidate dashboard cache on relevant mutations
// Note: These are placeholder handlers - actual mutations should call revalidateTag
export async function PATCH(req: Request) {
  revalidateTag('dashboard-admin', {});
  revalidateTag('dashboard-user', {});
  return NextResponse.json({ success: true });
}