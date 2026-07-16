import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReviewActionButtons from '@/components/review-action-buttons';

// Force dynamic rendering so modifications are fetched directly
export const revalidate = 0;

interface PageProps {
  params: Promise<{ reviewid: string }>;
}

async function getReviewDetails(reviewIdStr: string) {
  const numericId = parseInt(reviewIdStr, 10);
  if (isNaN(numericId)) {
    return null;
  }

  // Fetch the primary review
  const review = await prisma.review.findUnique({
    where: { id: numericId },
    include: {
      user: true,
      game: true,
    },
  });

  if (!review) return null;

  // Fetch related reviews for the same game dynamically (excluding the current review)
  const relatedReviews = await prisma.review.findMany({
    where: {
      game_id: review.game_id,
      id: { not: numericId },
      is_archived: false,
    },
    take: 2,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      user: true,
    },
  });

  return { review, relatedReviews };
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewid } = await params;
  const data = await getReviewDetails(reviewid);

  if (!data) {
    notFound();
  }

  const { review, relatedReviews } = data;

  const formattedDate = review.created_at.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-16 py-8">

      {/* 1. REVIEW BANNER HERO */}
      <div className="relative min-h-[500px] bg-brand-surface border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-8 md:p-12 shadow-2xl">
        {review.game?.cover_image ? (
          <img 
            src={review.game.cover_image} 
            alt={`${review.game.title} backdrop`}
            className="absolute inset-0 w-full h-full object-cover opacity-20 scale-105 filter blur-[1px]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-brand-tertiary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent z-10" />

        <div className="relative z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-gray-400">
              <span>Game Directory</span>
              <span className="text-white/20">•</span>
              <span>{review.game?.release_date ? new Date(review.game.release_date).getFullYear() : 'N/A'}</span>
            </div>
            {review.game?.rating_avg !== undefined && (
              <div className="bg-brand-bg/80 border border-white/10 px-4 py-2 rounded backdrop-blur-sm shadow-lg">
                <div className="text-lg font-mono font-bold text-brand-primary-button">
                  {review.game.rating_avg.toFixed(1)}
                </div>
              </div>
            )}
          </div>
          <h1 className="font-headline text-4xl md:text-6xl text-white font-bold leading-tight mb-3">
            {review.game?.title || 'Unknown Title'}
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light max-w-2xl line-clamp-3">
            {review.game?.description}
          </p>
        </div>

        <div className="relative z-20 space-y-6">
          <div className="border-t border-white/10 pt-6">
            <h2 className="font-headline text-2xl md:text-3xl text-white font-bold mb-4">
              {review.title}
            </h2>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-sm font-bold text-white uppercase">
                  {review.user?.username ? review.user.username[0] : 'U'}
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-gray-200 block text-sm">
                    {review.user?.username || 'Anonymous Critic'}
                  </span>
                  <span className="text-gray-500 text-xs">{formattedDate}</span>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-lg border ${
                review.recommended ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-red-500/10 border-red-400/30'
              } text-center`}>
                <div className={`text-sm font-bold uppercase tracking-widest ${
                  review.recommended ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {review.recommended ? '✓ Recommended' : '✗ Avoid'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY ARTICLE CONTENT */}
      <div className="space-y-6">
        <div className="prose prose-invert max-w-none">
          <div className="bg-brand-surface border border-white/5 rounded-lg p-8 md:p-10 shadow-md space-y-6">
            {review.body.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="text-gray-300 leading-relaxed font-light text-base md:text-lg">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </div>
      </div>

      {/* 3. CLIENT ACTION INTERACTIVE ROW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="text-sm">
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Community Response</span>
          </div>
        </div>
        <ReviewActionButtons 
          reviewId={review.id} 
          initialLikes={review.likes_count} 
        />
      </div>

      {/* 4. MORE REVIEWS GRID (DYNAMICALLY LOADED FROM SAME GAME) */}
      <div className="space-y-6 border-t border-white/5 pt-8">
        <div className="flex justify-between items-baseline">
          <div>
            <h3 className="font-headline text-2xl text-white font-bold">More Reviews</h3>
            <p className="text-xs text-gray-500 mt-0.5">Other perspectives on {review.game?.title}</p>
          </div>
          {review.game && (
            <Link 
              href={`/games/${review.game.id}`} 
              className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition"
            >
              View All Reviews
            </Link>
          )}
        </div>

        {relatedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedReviews.map((relatedReview) => {
              const relatedFormattedDate = relatedReview.created_at.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <Link key={relatedReview.id} href={`/reviews/${relatedReview.id}`} className="group">
                  <div className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/20 rounded-lg p-6 transition group-hover:shadow-lg shadow-md h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-headline text-lg text-white font-bold group-hover:text-brand-primary-button transition line-clamp-1">
                            {relatedReview.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <div className="w-4 h-4 rounded-full bg-brand-secondary flex items-center justify-center text-[8px] font-bold text-white uppercase">
                              {relatedReview.user?.username ? relatedReview.user.username[0] : 'U'}
                            </div>
                            <span>{relatedReview.user?.username || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{relatedFormattedDate}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                          relatedReview.recommended ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {relatedReview.recommended ? '✓ Recommend' : '✗ Avoid'}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed font-light line-clamp-2">
                        {relatedReview.body}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold tracking-wider border-t border-white/5 pt-3 mt-4">
                      <span>👍 {(relatedReview.likes_count ?? 0).toLocaleString()}</span>
                      <span className="text-brand-secondary">See Review →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm bg-brand-surface rounded border border-white/5">
            There are no other community reviews for this title yet.
          </div>
        )}
      </div>

    </div>
  );
}