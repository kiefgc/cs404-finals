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

  // Fetch the primary review with exact model definitions
  const review = await prisma.review.findUnique({
    where: { id: numericId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      game: {
        include: {
          game_genres: {
            include: {
              genre: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!review) return null;

  // Fetch related reviews for the same game dynamically (excluding current)
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
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  // Scale raw database rating safely if game object is valid
  let displayRating = '0.0';
  if (review.game) {
    displayRating = review.game.rating_avg <= 5 
      ? (review.game.rating_avg * 2).toFixed(1) 
      : review.game.rating_avg.toFixed(1);
  }

  return { 
    review: {
      ...review,
      game: review.game ? {
        ...review.game,
        rating_avg: displayRating,
        genres: review.game.game_genres.map((gg) => gg.genre.name),
      } : null,
      likes_count: review._count?.likes || 0,
      user: {
        id: review.user?.id || 0,
        name: review.user?.name || 'Anonymous Critic',
      }
    }, 
    relatedReviews: relatedReviews.map((rr) => ({
      ...rr,
      likes_count: rr._count?.likes || 0,
      user: {
        id: rr.user?.id || 0,
        name: rr.user?.name || 'Anonymous'
      }
    }))
  };
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewid } = await params;
  const data = await getReviewDetails(reviewid);

  if (!data) {
    notFound();
  }

  const { review, relatedReviews } = data;

  const formattedDate = review.created_at ? review.created_at.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).toUpperCase() : 'RECENT';

  return (
    <div className="min-h-screen bg-brand-bg text-white py-12 px-4 md:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* BACK NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link 
            href="/reviews"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#96c2a6] hover:text-[#bce0b8] transition"
          >
            ← Back to All Reviews
          </Link>
        </div>

        {/* 1. GAME DETAILS BACKDROP HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-brand-surface/40 min-h-[400px] flex flex-col justify-end">
          {/* Background Image Layer */}
          {review.game?.cover_image && (
            <div className="absolute inset-0 z-0">
              <img 
                src={review.game.cover_image} 
                alt={`${review.game.title} backdrop`}
                className="w-full h-full object-cover object-top opacity-70 transition-opacity duration-300"
              />
              {/* Fade filters for flawless text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/50 to-black/15" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/85 via-transparent to-transparent" />
            </div>
          )}

          {/* Hero Content Layer */}
          <div className="relative z-10 p-6 md:p-12 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-gray-400">
              <span className="text-gray-300 uppercase">
                RELEASED {review.game?.release_date ? new Date(review.game.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
              </span>
              {review.game?.genres?.map((genre) => (
                <span key={genre} className="text-[#96c2a6]">
                  · {genre.toUpperCase()}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="md:col-span-2 space-y-3">
                {review.game ? (
                  <Link href={`/games/${review.game.id}`} className="group">
                    <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white group-hover:text-[#96c2a6] transition drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                      {review.game.title}
                    </h1>
                  </Link>
                ) : (
                  <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight tracking-tight text-gray-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    Unknown Game Title
                  </h1>
                )}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] line-clamp-3">
                  {review.game?.description || 'No game description details available.'}
                </p>
              </div>

              {/* Game Score Box */}
              <div className="flex justify-start md:justify-end">
                <div className="flex h-20 w-20 flex-col items-center justify-center border border-white/10 bg-black/85 p-3 text-center rounded shadow-2xl">
                  <span className="text-2xl font-bold text-[#96c2a6]">{review.game?.rating_avg || '0.0'}</span>
                  <span className="text-[8px] mt-1 font-semibold uppercase tracking-widest text-gray-400">Score</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CRITIQUE TITLE & METADATA GRID */}
        <section className="border-b border-white/10 pb-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h2 className="font-serif text-3xl font-semibold leading-tight text-white">
                "{review.title}"
              </h2>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-brand-secondary flex items-center justify-center text-sm font-bold text-white uppercase">
                  {review.user?.name ? review.user.name[0] : 'U'}
                </div>
                <div className="space-y-0.5">
                  <Link 
                    href={`/profile/${review.user?.id}`}
                    className="font-semibold text-gray-200 hover:text-[#96c2a6] transition block text-sm"
                  >
                    {review.user?.name}
                  </Link>
                  <span className="text-gray-500 text-[10px] tracking-wider font-semibold">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Verdict Stamp */}
            <div className={`px-4 py-2 rounded-sm border ${
              review.recommended ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
            } text-center`}>
              <div className={`text-xs font-bold uppercase tracking-widest ${
                review.recommended ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {review.recommended ? '✓ Recommended' : '✗ Avoid'}
              </div>
            </div>
          </div>
        </section>

        {/* 3. BODY ARTICLE CONTENT */}
        <section className="space-y-6">
          <article className="prose prose-invert max-w-none">
            <div className="bg-brand-surface border border-white/5 rounded-sm p-8 md:p-10 shadow-xl space-y-6">
              {review.body ? review.body.split('\n').map((paragraph, idx) => (
                paragraph.trim() && (
                  <p key={idx} className="font-serif italic text-gray-300 leading-relaxed text-base md:text-lg">
                    "{paragraph.trim()}"
                  </p>
                )
              )) : (
                <p className="font-serif italic text-gray-500 leading-relaxed text-base">
                  No review body text provided.
                </p>
              )}
            </div>
          </article>
        </section>

        {/* 4. INTERACTIVE ROW */}
        <section className="space-y-4 border-b border-white/10 pb-6">
          <div className="text-sm">
            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Community Response</span>
          </div>
          <ReviewActionButtons 
            reviewId={review.id.toString} 
            initialLikes={review.likes_count} 
          />
        </section>

        {/* 5. RELATED CRITIQUES SECTION */}
        <section className="space-y-6 pt-6">
          <div>
            <h3 className="font-serif text-2xl text-white font-semibold">More Reviews</h3>
            <p className="text-xs text-gray-500 mt-0.5">Other analytical perspectives on {review.game?.title || 'this title'}</p>
          </div>

          {relatedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedReviews.map((relatedReview) => {
                const relatedFormattedDate = relatedReview.created_at ? relatedReview.created_at.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                }).toUpperCase() : 'RECENT';

                return (
                  <Link key={relatedReview.id} href={`/reviews/${relatedReview.id}`} className="group">
                    <article className="bg-brand-surface border border-white/5 hover:border-[#96c2a6]/20 rounded-sm p-6 transition-all duration-200 group-hover:shadow-lg h-full flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-serif text-lg text-white font-semibold group-hover:text-[#96c2a6] transition line-clamp-1">
                              "{relatedReview.title}"
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-2 font-semibold tracking-wider">
                              <div className="w-4 h-4 rounded-sm bg-brand-secondary flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                {relatedReview.user?.name ? relatedReview.user.name[0] : 'U'}
                              </div>
                              <span>{relatedReview.user?.name}</span>
                              <span>•</span>
                              <span>{relatedFormattedDate}</span>
                            </div>
                          </div>
                          <div className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                            relatedReview.recommended 
                              ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' 
                              : 'text-red-400 bg-red-500/5 border-red-500/10'
                          }`}>
                            {relatedReview.recommended ? '✓ Recommend' : '✗ Avoid'}
                          </div>
                        </div>
                        <p className="font-serif italic text-gray-400 text-xs leading-relaxed line-clamp-2">
                          "{relatedReview.body}"
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold tracking-wider border-t border-white/5 pt-3">
                        <span>👍 {relatedReview.likes_count.toLocaleString()}</span>
                        <span className="text-[#96c2a6] group-hover:translate-x-1 transition-transform duration-150">See Critique →</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm bg-brand-surface rounded-sm border border-dashed border-white/10">
              There are no other community reviews for this title yet.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}