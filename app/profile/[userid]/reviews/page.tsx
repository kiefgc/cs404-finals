import Link from 'next/link';
import { getReviewsByUserId, getUserById } from '@/lib/mockData';

export default async function ProfileReviewsPage({ params }: { params: Promise<{ userid: string }> }) {
  const { userid } = await params;
  const profileUser = getUserById(userid);
  const userRecentReviews = getReviewsByUserId(profileUser.user_id ?? 1, 3);

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
        {userRecentReviews.map((review) => {
          const reviewDate = new Date(review.date_created || '');
          const formattedDate = reviewDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <article
              key={review.review_id}
              className="rounded-3xl border border-white/10 bg-brand-surface shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary text-sm font-semibold uppercase text-white">
                      {review.user_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.user_name}</p>
                      <p className="text-xs text-gray-500">
                        {formattedDate} · {review.game_title}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                      review.recommended ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {review.recommended ? 'Recommended' : 'Not Recommended'}
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-tertiary/10 via-brand-bg/70 to-brand-bg p-5 text-white shadow-inner">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Review</p>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
                        {review.review_title}
                      </h2>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300 line-clamp-4">{review.body}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-gray-400">
                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-gray-500">
                    <span>👍 {review.likes_count?.toLocaleString()}</span>
                    <span>{review.game_title}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/reviews/${review.review_id}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
                    >
                      View full post
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
