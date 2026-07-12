import Link from 'next/link';
import GameCard from '@/components/gamecard';
import ReviewCard from '@/components/reviewcard';
import { LATEST_GAMES_MOCK, LATEST_REVIEWS_MOCK } from '@/lib/mockData';

export default function Home() {
  const featuredReview = LATEST_REVIEWS_MOCK[0];

  return (
    <div className="space-y-20 py-6">
      
      {/* 1. TOP ITEM: Hottest Review of the Week */}
      <div className="relative bg-brand-surface border border-white/5 rounded p-8 md:p-12 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div className="max-w-xl space-y-4">
          <span className="text-[10px] uppercase font-bold text-brand-primary-button tracking-widest bg-brand-primary/20 px-2.5 py-1 rounded-sm border border-brand-primary/30">
            Hottest Review of the Week
          </span>
          <h2 className="font-headline text-4xl md:text-5xl text-white font-bold leading-tight">
            {featuredReview.review_title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            {featuredReview.body}
          </p>
          <div className="pt-2">
            <Link href={`/reviews/${featuredReview.review_id}`} className="text-xs uppercase font-bold tracking-widest text-brand-primary-light hover:text-white transition inline-flex items-center gap-1">
              Read Full Critique <span>→</span>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-80 aspect-video md:aspect-square bg-brand-bg rounded border border-white/5 flex items-center justify-center text-xs text-gray-600 font-mono shadow-inner">
          [ Meccha Chameleon Image ]
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Latest Critiques (3 Columns) */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
          <div>
            <h3 className="font-headline text-2xl text-white font-bold">Latest Critiques</h3>
            <p className="text-xs text-gray-500 mt-0.5">Discerning perspectives on current releases.</p>
          </div>
          <Link href="/reviews" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition">
            View All
          </Link>
        </div>

        {/* 3-Column Grid Layout for Critiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {LATEST_REVIEWS_MOCK.map((review) => (
            <ReviewCard key={review.review_id} review={review} />
          ))}
        </div>
      </div>

      {/* Latest Games Grid Layout Rows */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
          <div>
            <h3 className="font-headline text-2xl text-white font-bold">Latest Games</h3>
            <p className="text-xs text-gray-500 mt-0.5">Essential restarts for the awakening player.</p>
          </div>
          <Link href="/games" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition">
            View All
          </Link>
        </div>

        {/* 4-Column Grid Array mapping straight to cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {LATEST_GAMES_MOCK.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      </div>

    </div>

  );
}