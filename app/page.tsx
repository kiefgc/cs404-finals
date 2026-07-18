import Link from 'next/link';
import GameCard from '@/components/gamecard';
import ReviewCard from '@/components/reviewcard';
import { prisma } from '@/lib/prisma';
import { Game, Review } from '@/types';

// Force dynamic rendering so database updates show immediately
export const revalidate = 0;

async function getHomeData() {
  // 1. Fetch 6 most recent games (including their genre connections)
  const dbGames = await prisma.game.findMany({
    orderBy: { created_at: 'desc' },
    take: 6,
    include: {
      game_genres: {
        include: {
          genre: true,
        },
      },
    },
  });

  // 2. Fetch 6 most recent active (non-archived) reviews (including game names)
  const dbReviews = await prisma.review.findMany({
    where: { is_archived: false },
    orderBy: { created_at: 'desc' },
    take: 6,
    include: {
      game: true,
    },
  });

  // 3. Map dbGames to fit GameCard component structure
  const games: Game[] = dbGames.map((game) => {
    // Extract first genre safely if it exists
    const primaryGenre = game.game_genres[0]?.genre?.name || '';
    
    return {
      game_id: game.id,
      title: game.title,
      release_date: game.release_date.toISOString(),
      cover_image: game.cover_image || null,
      description: game.description,
      rating_avg: game.rating_avg,
      genre_name: primaryGenre,
    };
  });

  // 4. Map dbReviews safely to prevent title crashes if a relation is missing
  const reviews: Review[] = dbReviews.map((review) => ({
    review_id: review.id,
    game_title: review.game?.title || 'Unknown Game', // Fixed: Prevents undefined crash
    review_title: review.title,
    body: review.body,
    rating: review.rating,
    recommended: review.recommended,
    date_created: review.created_at.toISOString(),
  }));

  return { games, reviews };
}

export default async function Home() {
  const { games, reviews } = await getHomeData();

  // Pick the absolute newest review as the "Hottest" featured review
  const featuredReview = reviews[0];

  return (
    <div className="space-y-20 py-6">
      
      {/* 1. TOP ITEM: Hottest Review of the Week */}
      {featuredReview ? (
        <div className="relative bg-brand-surface border border-white/5 rounded p-8 md:p-12 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="max-w-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-brand-primary-button tracking-widest bg-brand-primary/20 px-2.5 py-1 rounded-sm border border-brand-primary/30">
              Hottest Review of the Week
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-white font-bold leading-tight">
              {featuredReview.review_title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-light line-clamp-3">
              {featuredReview.body}
            </p>
            <div className="pt-2">
              <Link href={`/reviews/${featuredReview.review_id}`} className="text-xs uppercase font-bold tracking-widest text-brand-primary-light hover:text-white transition inline-flex items-center gap-1">
                Read Full Critique <span>→</span>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-80 aspect-video md:aspect-square bg-brand-bg rounded border border-white/5 flex flex-col items-center justify-center p-6 text-center text-xs text-gray-500 font-mono shadow-inner gap-2">
            <span className="text-gray-400 font-headline text-base font-medium">{featuredReview.game_title}</span>
            <span className="text-[10px] uppercase text-brand-primary-button tracking-wider font-bold">
              {featuredReview.recommended ? '★ Recommended' : '★ Not Recommended'}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-brand-surface rounded border border-white/5 text-gray-500">
          No reviews found in database. Seed some reviews to see them here!
        </div>
      )}

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

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            No critiques published yet.
          </div>
        )}
      </div>

      {/* 3. BOTTOM SECTION: Latest Games Grid Layout Rows */}
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

        {games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {games.slice(0, 4).map((game) => (
              <GameCard key={game.game_id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            No games added yet.
          </div>
        )}
      </div>

    </div>
  );
}