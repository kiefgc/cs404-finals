import Link from 'next/link';
import GameCard from '@/components/gamecard';
import ReviewCard from '@/components/reviewcard';
import { getUserById, getUserLikedGames, getReviewsByUserId } from '@/lib/mockData';

export default async function ProfilePage({ params }: { params: Promise<{ userid: string }> }) {
  const { userid } = await params;
  const profileUser = getUserById(userid);
  const profileGames = getUserLikedGames(userid);
  const profileReviews = getReviewsByUserId(profileUser.user_id ?? 1, 3);

  return (
    <div className="space-y-12 py-6">
      <section className="bg-brand-surface border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
        <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-tertiary border border-white/10 text-4xl font-bold text-brand-primary-button">
                  JV
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl text-white font-bold tracking-tight">{profileUser.name}</h1>
                  <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{profileUser.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-full border border-brand-primary-button/30 bg-brand-primary-button/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-brand-primary-button/20"
                >
                  Edit Profile
                </Link>
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
                <p className="mt-4 text-3xl font-bold text-white">{profileUser.followersCount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-brand-bg/70 p-6">
              <p className="text-sm text-gray-400 leading-relaxed">{profileUser.bio}</p>
            </div>
        </div>
      </section>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {profileGames.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      </section>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profileReviews.map((review) => (
            <ReviewCard key={review.review_id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
