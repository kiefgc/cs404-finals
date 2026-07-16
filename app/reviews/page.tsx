import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LikeReviewButton from '@/components/like-review-button';

// Force dynamic rendering so new reviews show up instantly
export const revalidate = 0;

async function getRecentReviews() {
  const reviews = await prisma.review.findMany({
    where: {
      is_archived: false,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      user: true,
      game: true, // Pulls the game title automatically!
    },
  });

  return reviews;
}

export default async function ReviewsPage() {
  const reviews = await getRecentReviews();

  return (
    <div className="space-y-10 py-8">
      {/* HEADER SECTION */}
      <header className="rounded-3xl border border-white/10 bg-brand-surface p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Community Feed</p>
            <h1 className="mt-3 text-4xl font-headline text-white font-bold sm:text-5xl">
              Most recent reviews
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              Scroll through the latest community takes in a continuous feed. Each review is pulled dynamically from the database, complete with game titles, ratings, and authors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* REVIEWS FEED */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const formattedDate = review.created_at.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <article 
                key={review.id} 
                className="rounded-3xl border border-white/10 bg-brand-surface shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  
                  {/* REVIEW HEADER */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary text-sm font-semibold uppercase text-white">
                        {review.user?.username ? review.user.username.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {review.user?.username || 'Anonymous Critic'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formattedDate} · <span className="text-brand-primary-button font-medium">{review.game?.title || 'Unknown Title'}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                      review.recommended ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                    }`}>
                      {review.recommended ? 'Recommended' : 'Avoid'}
                    </div>
                  </div>

                  {/* REVIEW BODY BOX */}
                  <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-tertiary/10 via-brand-bg/70 to-brand-bg p-5 text-white shadow-inner">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Review</p>
                        <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
                          {review.title}
                        </h2>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300 line-clamp-4">
                        {review.body}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS & SOCIAL STRIP */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-gray-500">
                      {/* Interactive Like Component we built earlier */}
                      <LikeReviewButton 
                        reviewId={review.id} 
                        initialLikes={review.likes_count} 
                      />
                      <span>{review.game?.title}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        href={`/reviews/${review.id}`} 
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
                      >
                        View full post
                      </Link>
                    </div>
                  </div>

                </div>
              </article>
            );
          })
        ) : (
          <div className="text-center py-16 text-gray-500 text-sm bg-brand-surface rounded-3xl border border-white/10">
            There are no community reviews written yet. Be the first to add one!
          </div>
        )}
      </div>
    </div>
  );
}