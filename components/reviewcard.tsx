import Link from 'next/link';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export default function ReviewCard({ review: critique, compact = false }: ReviewCardProps) {
  // 1. Safe date fallback to prevent crashing on missing dates
  const reviewDate = critique.date_created ? new Date(critique.date_created) : new Date();
  const formattedDate = reviewDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // 2. Safe game title fallback (if game relation is broken or undefined)
  const displayGameTitle = critique.game_title || 'Unknown Game';

  if (compact) {
    // Compact card variant for dense listings
    return (
      <Link href={`/reviews/${critique.review_id}`} className="group block">
        <div className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/20 rounded-lg p-4 transition shadow-md">
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-gray-200 group-hover:text-brand-primary-button transition line-clamp-2 flex-1 text-sm">
                {critique.review_title}
              </h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-light">
              {critique.body}
            </p>
            <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-wider border-t border-white/5 pt-2">
              <span className={critique.recommended ? 'text-emerald-400' : 'text-red-400'}>
                {critique.recommended ? 'Recommended' : 'Not Recommended'}
              </span>
              <span className="text-brand-secondary">Read Review →</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full card variant (default)
  return (
    <Link href={`/reviews/${critique.review_id}`} className="group block w-full">
      <div className="bg-brand-surface rounded border border-white/5 overflow-hidden transition-all duration-300 group-hover:border-brand-primary-button/30 group-hover:scale-[1.01] shadow-md flex flex-col h-full">

        {/* Review Information Block */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <h4 className="font-headline text-lg text-white font-semibold leading-snug group-hover:text-brand-primary-light transition">
            {critique.review_title}
          </h4>

          <div className="flex items-center justify-between text-xs">
            {/* Using our fallback game title here */}
            <span className="text-gray-500 truncate max-w-[150px]">{displayGameTitle}</span>
            <span className={`font-bold ${critique.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
              {critique.recommended ? 'Recommend' : 'Not Recommended'}
            </span>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed font-light line-clamp-2 pt-1 flex-1">
            {critique.body}
          </p>

          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold border-t border-white/5 pt-3">
            {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  );
}