'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LikeReviewButton from './like-review-button';

interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  recommended: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    handle: string | null;
    profile_pic: string | null;
    role: string;
  };
  game: {
    id: string;
    title: string;
    cover_image: string | null;
    release_date: string | null;
  };
  likes_count: number;
  liked_by_current_user: boolean;
}

interface ReviewsPageClientProps {
  initialReviews: Review[];
  nextCursor: string | undefined;
  currentUserId?: number;
}

export default function ReviewsPageClient({ initialReviews, nextCursor, currentUserId }: ReviewsPageClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [cursor, setCursor] = useState<string | undefined>(nextCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(!!nextCursor);
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchMoreReviews = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '5');
      params.set('cursor', cursor);
      if (currentUserId) {
        params.set('userId', currentUserId.toString());
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const newReviews = data.reviews as Review[];
      const newCursor = data.nextCursor as string | undefined;

      setReviews((prev) => [...prev, ...newReviews]);
      setCursor(newCursor);
      setHasMore(!!newCursor && newReviews.length > 0);
    } catch (error) {
      console.error('Failed to load more reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  // Set up intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreReviews();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (observerTarget.current) {
      observerRef.current.observe(observerTarget.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchMoreReviews, hasMore, loading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-[#96c2a6] fill-current' : 'text-white/30 fill-current'}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  if (reviews.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-white py-12 px-4 md:px-8">
        <div className="mx-auto max-w-5xl text-center py-12">
          <p className="text-white/60">No reviews yet. Be the first to write one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white py-12 px-4 md:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <header className="border-b border-white/10 pb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#96c2a6]">
              Community Feed
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Latest Reviews
            </h1>
            <p className="text-white/60 text-lg">
              What the community is playing and saying
            </p>
          </div>
        </header>

        {/* Reviews List */}
        <div className="space-y-8" role="feed" aria-label="Community reviews">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="group relative bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/5"
            >
              {/* Game Badge */}
              <div className="mb-4 flex items-center gap-3">
                <Link
                  href={`/games/${review.game.id}`}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {review.game.cover_image && (
                    <img
                      src={review.game.cover_image}
                      alt=""
                      className="w-5 h-5 rounded object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="text-xs font-medium text-white/80 truncate max-w-[150px]">
                    {review.game.title}
                  </span>
                </Link>
                <span className="text-[10px] font-mono text-white/30">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {/* Review Header */}
              <div className="mb-4 flex items-center gap-3">
                <Link href={`/profile/${review.user.id}`} className="group flex items-center gap-2">
                  {review.user.profile_pic ? (
                    <img
                      src={review.user.profile_pic}
                      alt=""
                      className="w-8 h-8 rounded-full border border-white/10 group-hover:border-[#96c2a6]/50 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#96c2a6] to-[#6b9b7a] flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-bg">
                        {review.user.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white group-hover:text-[#96c2a6] transition-colors">
                      {review.user.name || 'Anonymous Critic'}
                    </p>
                    {review.user.handle && (
                      <p className="text-[11px] text-white/40 font-mono">
                        @{review.user.handle}
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              {/* Rating Stars */}
              <div className="mb-3 flex items-center gap-1" aria-label={`Rating: ${review.rating} out of 10`}>
                {renderStars(review.rating)}
                <span className="text-sm font-mono text-[#96c2a6] ml-1">{review.rating}/10</span>
                {review.recommended ? (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] bg-[#96c2a6]/20 text-[#96c2a6] rounded-full border border-[#96c2a6]/30">
                    Recommended
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                    Not Recommended
                  </span>
                )}
              </div>

              {/* Review Title & Body */}
              <div className="mb-4">
                <Link href={`/reviews/${review.id}`} className="group">
                  <h2 className="text-xl font-semibold text-white group-hover:text-[#96c2a6] transition-colors mb-2">
                    {review.title}
                  </h2>
                </Link>
                <p className="text-white/70 leading-relaxed line-clamp-4">{review.body}</p>
              </div>

              {/* Actions Footer */}
              <footer className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <LikeReviewButton
                    reviewId={review.id}
                    initialLikes={review.likes_count}
                    initialLiked={review.liked_by_current_user}
                  />
                </div>
                <Link
                  href={`/reviews/${review.id}`}
                  className="text-sm font-medium text-white/60 hover:text-[#96c2a6] transition-colors flex items-center gap-1"
                >
                  Read full review
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </footer>
            </article>
          ))}

          {/* Load More Trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-white/60">
                <svg className="animate-spin h-5 w-5 text-[#96c2a6]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm">Loading more reviews...</span>
              </div>
            )}
            {!hasMore && reviews.length > 0 && !loading && (
              <p className="text-sm text-white/40">You've seen all reviews</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}