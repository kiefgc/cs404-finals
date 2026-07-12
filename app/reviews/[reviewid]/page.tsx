import Link from 'next/link';
import { getReviewDetailById } from '@/lib/mockData';

export default async function ReviewDetailPage({ params }: { params: Promise<{ reviewid: string }> }) {
  const { reviewid } = await params;
  const review = getReviewDetailById(reviewid);
  const reviewDate = review.date_created ? new Date(review.date_created) : new Date();
  const formattedDate = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-16 py-8">
      
      {/* 1. HERO SECTION WITH GAME AND REVIEW CONTEXT */}
      <div className="relative min-h-[600px] bg-brand-surface border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-8 md:p-12 shadow-2xl">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-brand-tertiary/10 z-10" />
        <div className="absolute inset-0 flex items-center justify-center text-white/5 text-sm font-mono tracking-widest uppercase select-none">
          [ Game Cover Artwork ]
        </div>

        {/* Top: Game Info */}
        <div className="relative z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-gray-400">
              <span>Game</span>
              <span className="text-white/20">•</span>
              <span>{review.game_info.release_date}</span>
            </div>
            <div className="bg-brand-bg/80 border border-white/10 px-4 py-2 rounded backdrop-blur-xs shadow-lg">
              <div className="text-lg font-mono font-bold text-brand-primary-button">
                {review.game_info.rating_avg.toFixed(1)}
              </div>
            </div>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl text-white font-bold leading-tight mb-3">
            {review.game_title}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light max-w-2xl">
            {review.game_info.description}
          </p>
        </div>

        {/* Bottom: Review Info and Community Rating */}
        <div className="relative z-20 space-y-6">
          {/* Review Title and Verdict */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="font-headline text-2xl md:text-3xl text-white font-bold mb-4">
              {review.review_title}
            </h2>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-sm font-bold text-white uppercase">
                  {(review.user_name ?? 'A')[0]}
                </div>
                <div className="space-y-1">
                  <Link href={`/profile/${review.user_id}`} className="font-semibold text-gray-200 hover:text-brand-primary-button transition block text-sm">
                    {review.user_name ?? 'Anonymous'}
                  </Link>
                  <span className="text-gray-500 text-xs">{formattedDate}</span>
                </div>
              </div>

              {/* Verdict Badge */}
              <div className={`px-4 py-2 rounded-lg border ${review.recommended ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-red-500/10 border-red-400/30'} text-center`}>
                <div className={`text-sm font-bold uppercase tracking-widest ${review.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
                  {review.recommended ? '✓ Recommended' : '✗ Not Recommended'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REVIEW BODY - MAIN CONTENT */}
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

      {/* 3. REVIEW ENGAGEMENT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="text-sm">
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Community Response</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Likes/Helpful */}
          <button className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/30 rounded-lg p-4 text-center transition group shadow-md">
            <div className="text-2xl mb-2 group-hover:scale-110 transition">👍</div>
            <div className="text-sm font-mono font-bold text-brand-primary-button">
              {(review.likes_count ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
              Found Helpful
            </div>
          </button>

          {/* Share */}
          <button className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/30 rounded-lg p-4 text-center transition group shadow-md">
            <div className="text-2xl mb-2 group-hover:scale-110 transition">🔗</div>
            <div className="text-sm font-semibold text-gray-300">
              Share
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
              Review Link
            </div>
          </button>

          {/* Report */}
          <button className="bg-brand-surface border border-white/5 hover:border-red-500/30 rounded-lg p-4 text-center transition group shadow-md">
            <div className="text-2xl mb-2 group-hover:scale-110 transition">⚠️</div>
            <div className="text-sm font-semibold text-gray-300">
              Report
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
              Inappropriate
            </div>
          </button>
        </div>
      </div>

      {/* 4. RELATED REVIEWS / BACK NAVIGATION */}
      <div className="space-y-6 border-t border-white/5 pt-8">
        <div className="flex justify-between items-baseline">
          <div>
            <h3 className="font-headline text-2xl text-white font-bold">More Reviews</h3>
            <p className="text-xs text-gray-500 mt-0.5">Other perspectives on {review.game_title}</p>
          </div>
          <Link href={`/games/${review.game_id}`} className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition">
            View All Reviews
          </Link>
        </div>

        {/* Related Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {review.related_reviews.map((relatedReview) => {
            const relatedDate = relatedReview.date_created ? new Date(relatedReview.date_created) : new Date();
            const relatedFormattedDate = relatedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <Link key={relatedReview.review_id} href={`/reviews/${relatedReview.review_id}`} className="group">
                <div className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/20 rounded-lg p-6 transition group-hover:shadow-lg shadow-md h-full">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-headline text-lg text-white font-bold group-hover:text-brand-primary-button transition">
                          {relatedReview.review_title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <div className="w-4 h-4 rounded-full bg-brand-secondary flex items-center justify-center text-[8px] font-bold text-white uppercase">
                            {(relatedReview.user_name ?? 'A')[0]}
                          </div>
                          <span>{relatedReview.user_name ?? 'Anonymous'}</span>
                          <span>•</span>
                          <span>{relatedFormattedDate}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${relatedReview.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
                        {relatedReview.recommended ? '✓ Recommended' : '✗ Not Recommended'}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-light line-clamp-2">
                      {relatedReview.body}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold tracking-wider border-t border-white/5 pt-3">
                      <span>👍 {(relatedReview.likes_count ?? 0).toLocaleString()}</span>
                      <span className="text-brand-secondary">See Review →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
