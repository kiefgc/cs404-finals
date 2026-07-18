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
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      game: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    title: review.title,
    body: review.body,
    rating: review.rating,
    recommended: review.recommended,
    created_at: review.created_at,
    likes_count: review._count?.likes || 0,
    user: {
      id: review.user?.id || 0,
      name: review.user?.name || 'Anonymous Critic',
    },
    game: {
      id: review.game?.id || 0, // Defends against orphaned database records
      title: review.game?.title || 'Unknown Title',
    },
  }));
}

export default async function ReviewsPage() {
  const reviews = await getRecentReviews();

  return (
    <div className="min-h-screen bg-brand-bg text-white py-12 px-4 md:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* 1. EDITORIAL HEADER SECTION */}
        <header className="border-b border-white/10 pb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#96c2a6]">
              Community Feed
            </span>
            <h1 className="font-serif text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl">
              The Consensus
            </h1>
            <p className="text-sm leading-relaxed text-gray-400">
              A chronological ledger of critical reviews written by the QuestLog collective.
            </p>
          </div>
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-sm border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {/* 2. REVIEWS FEED COLUMN */}
        <div className="space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const formattedDate = review.created_at ? review.created_at.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }).toUpperCase() : 'RECENT';

              return (
                <article 
                  key={review.id} 
                  className="group rounded-sm border border-white/5 bg-brand-surface p-6 md:p-8 shadow-xl transition-all duration-200 hover:border-white/10"
                >
                  <div className="flex flex-col gap-6">
                    
                    {/* REVIEW METADATA HEADER */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Square Avatar matches our Game Details aesthetic */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-secondary text-sm font-semibold uppercase text-white">
                          {review.user?.name ? review.user.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-semibold text-white">
                              {review.user?.name || 'Anonymous Critic'}
                            </span>
                            <span className="text-gray-600 text-xs hidden sm:inline">|</span>
                            {review.game?.id ? (
                              <Link 
                                href={`/games/${review.game.id}`}
                                className="text-xs font-bold uppercase tracking-wider text-[#96c2a6] hover:text-[#bce0b8] transition"
                              >
                                {review.game.title}
                              </Link>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {review.game?.title}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] tracking-wider text-gray-500 font-semibold">
                              {formattedDate}
                            </span>
                            <span className="text-gray-700">·</span>
                            {/* Star Rating system directly aligned with the database field */}
                            <div className="flex text-xs text-[#a8cca4]">
                              {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                              {"☆".repeat(Math.max(0, 5 - Math.min(5, review.rating)))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clean recommendation stamp */}
                      <div className={`rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        review.recommended 
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/5 text-red-400 border-red-500/20'
                      }`}>
                        {review.recommended ? 'Recommended' : 'Avoid'}
                      </div>
                    </div>

                    {/* EDITORIAL CRITIQUE BODY */}
                    <div className="space-y-3 pl-0 md:pl-[60px]">
                      <h2 className="font-serif text-2xl font-semibold leading-tight text-white group-hover:text-emerald-300 transition duration-150">
                        "{review.title}"
                      </h2>
                      <p className="font-serif italic text-sm leading-relaxed text-gray-300 opacity-90 line-clamp-4">
                        {review.body}
                      </p>
                    </div>

                    {/* INTERACTIVE ACTIONS STRIP */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-5 pl-0 md:pl-[60px] text-xs text-gray-400">
                      <div className="flex items-center gap-6">
                        {/* Compact customizable like action */}
                        <LikeReviewButton 
                          reviewId={review.id.toString()} 
                          initialLikes={review.likes_count} 
                        />
                      </div>
                      
                      <div>
                        <Link 
                          href={`/reviews/${review.id}`} 
                          className="inline-flex items-center justify-center rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition"
                        >
                          Read Critique
                        </Link>
                      </div>
                    </div>

                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-20 text-gray-500 text-sm bg-brand-surface rounded-sm border border-dashed border-white/10">
              There are no community reviews written yet. Be the first to add one!
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}