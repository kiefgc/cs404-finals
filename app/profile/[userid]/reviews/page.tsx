import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Review } from '@/types';
import { authGuard } from '@/lib/auth/authUtils';
import ReviewCard from '@/components/reviewcard';

interface ProfileReviewsPageProps {
  params: Promise<{ userid: string }>;
}

async function getProfileReviewsData(userIdStr: string) {
  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) return null;

  try {
    // 1. Fetch user data safely
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
      },
    });

    if (!user) return null;

    // Get current session using authGuard
    const session = await authGuard();
    const currentUserId = session?.userId;

    // 2. Fetch all reviews authored by this user, joining game and likes count
    const dbReviews = await prisma.review.findMany({
      where: {
        user_id: userId,
        is_archived: false,
      },
      orderBy: { created_at: 'desc' },
      include: {
        game: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Map to matching layout structures safely handling optional or missing data elements
    const userReviews = dbReviews.map((review) => ({
      review_id: review.id,
      user_id: review.user_id,
      user_name: user.name || 'Anonymous Player',
      game_title: review.game?.title || 'Unknown Game',
      review_title: review.title || '',
      body: review.body || '',
      rating: review.rating || 0,
      recommended: review.recommended ?? true,
      date_created: review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString(),
      likes_count: review._count?.likes || 0,
      game_cover_image: review.game?.cover_image || null,
      is_archived: false,
    }));

    return {
      profileUser: {
        name: user.name || 'Anonymous Player',
      },
      userReviews,
      currentUserId,
    };
  } catch (error) {
    console.error("Error fetching user profile reviews:", error);
    return null;
  }
}

export default async function ProfileReviewsPage({ params }: ProfileReviewsPageProps) {
  const { userid } = await params;
  const data = await getProfileReviewsData(userid);

  if (!data) notFound();

  const { profileUser, userReviews, currentUserId } = data;

  return (
    <div className="space-y-10 py-2">
      <header className="rounded-3xl border border-white/10 bg-brand-surface p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Recent Activity</p>
            <h1 className="mt-3 text-4xl font-headline font-bold text-white sm:text-5xl">
              Most recent reviews by {profileUser.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              A full feed of the latest reviews from this profile, arranged in the same social-post style as the community reviews page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/profile/${userid}`}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
            >
              Back to profile
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {userReviews.length > 0 ? (
          userReviews.map((review) => (
            <ReviewCard
              key={review.review_id}
              review={review}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-brand-surface border border-white/10 rounded-3xl text-gray-500 text-sm">
            This player hasn&apos;t published any reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}