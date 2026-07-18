import Link from 'next/link';
import { notFound } from 'next/navigation';
import GameCard from '@/components/gamecard';
import ReviewCard from '@/components/reviewcard';
import { prisma } from '@/lib/prisma';
import { Game, Review } from '@/types';

export const revalidate = 0;

interface ProfilePageProps {
  params: Promise<{ userid: string }>;
}

async function getProfileData(userIdStr: string) {
  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) return null;

  try {
    // 1. Fetch user, metadata counts, and Role safely
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true, 
        _count: {
          select: {
            saved_games: true,
            reviews: { where: { is_archived: false } },
          },
        },
      },
    });

    if (!user) return null;

    // 2. Fetch top 4 saved games
    const dbSavedGames = await prisma.savedGame.findMany({
      where: { user_id: userId },
      take: 4,
      orderBy: {
        game_id: 'desc',
      },
      include: {
        game: {
          include: {
            game_genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });

    // Map to unified Game structure safely handling potentially missing fields
    const profileGames: Game[] = dbSavedGames.map((sg) => {
      const primaryGenre = sg.game?.game_genres?.[0]?.genre?.name || 'Unknown';
      return {
        game_id: sg.game.id,
        title: sg.game.title,
        release_date: sg.game.release_date ? new Date(sg.game.release_date).toISOString() : new Date().toISOString(),
        cover_image: sg.game.cover_image || null,
        description: sg.game.description || '',
        rating_avg: sg.game.rating_avg || 0,
        descript: sg.game.description || '',
        genre_name: primaryGenre,
      };
    });

    // 3. Fetch top 3 reviews
    const dbReviews = await prisma.review.findMany({
      where: { 
        user_id: userId,
        is_archived: false,
      },
      take: 3,
      orderBy: { created_at: 'desc' },
      include: {
        game: true,
      },
    });

    // Map to unified Review structure safely
    const profileReviews: Review[] = dbReviews.map((review) => ({
      review_id: review.id,
      game_title: review.game?.title || 'Unknown Game',
      review_title: review.title || '',
      body: review.body || '',
      rating: review.rating || 0,
      recommended: review.recommended ?? true,
      date_created: review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString(),
    }));

    // Safeguard the follower fallback metric depending on schema configuration
    const followersCount = (user._count as any).followers ?? 0;

    return {
      profileUser: {
        user_id: user.id,
        name: user.name || 'Anonymous Player',
        role: user.role?.name || 'USER', 
        bio: user.bio || 'This player has not set up a bio yet.',
        gamesCount: user._count.saved_games,
        reviewsCount: user._count.reviews,
        followersCount: followersCount,
      },
      profileGames,
      profileReviews,
    };
  } catch (error) {
    console.error("Error fetching profile database context:", error);
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userid } = await params;
  const data = await getProfileData(userid);

  if (!data) notFound();

  const { profileUser, profileGames, profileReviews } = data;

  // Dynamically grab initials safely
  const initials = profileUser.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PV';

  return (
    <div className="space-y-12 py-6">
      <section className="bg-brand-surface border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
        <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-tertiary border border-white/10 text-4xl font-bold text-brand-primary-button">
                  {initials}
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl text-white font-bold tracking-tight">{profileUser.name}</h1>
                  <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{profileUser.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 cursor-not-allowed"
                  title="Edit profile coming soon"
                >
                  Edit Profile
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-brand-bg/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Games</p>
                <p className="mt-4 text-3xl font-bold text-white">{profileUser.gamesCount}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-bg/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Reviews</p>
                <p className="mt-4 text-3xl font-bold text-white">{profileUser.reviewsCount}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-bg/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Followers</p>
                <p className="mt-4 text-3xl font-bold text-white">{profileUser.followersCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-brand-bg/70 p-6">
              <p className="text-sm text-gray-400 leading-relaxed">{profileUser.bio}</p>
            </div>
        </div>
      </section>

      {/* Favorite Games Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Favorite Games</p>
            <h2 className="mt-2 text-3xl font-headline text-white font-bold">Games this user returns to again and again</h2>
          </div>
          <Link href={`/profile/${userid}/games`} className="text-xs uppercase tracking-[0.3em] font-bold text-brand-primary-button hover:text-brand-primary-light transition">
            View liked games
          </Link>
        </div>

        {profileGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {profileGames.map((game) => (
              <GameCard key={game.game_id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-surface/50 rounded-3xl border border-white/5 text-gray-500 text-sm">
            This library is empty. Liked games will appear here.
          </div>
        )}
      </section>

      {/* Recent Reviews Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Recent Activity</p>
            <h2 className="mt-2 text-3xl font-headline text-white font-bold">Most recent reviews</h2>
          </div>
          <Link href={`/profile/${userid}/reviews`} className="text-xs uppercase tracking-[0.3em] font-bold text-brand-primary-button hover:text-brand-primary-light transition">
            View my reviews
          </Link>
        </div>

        {profileReviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {profileReviews.map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-surface/50 rounded-3xl border border-white/5 text-gray-500 text-sm">
            No critiques published yet.
          </div>
        )}
      </section>
    </div>
  );
}