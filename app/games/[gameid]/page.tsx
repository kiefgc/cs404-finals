import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SaveGameButton from '@/components/save-game-button';
import LikeReviewButton from '@/components/like-review-button';

// Force dynamic rendering so updates reflect immediately
export const revalidate = 0;

interface PageProps {
  params: Promise<{ gameid: string }>;
}

async function getGameDetails(gameId: string) {
  // Convert URL string parameter to an integer safely to avoid Prisma ValidationError
  const numericId = parseInt(gameId, 10);
  if (isNaN(numericId)) {
    return null;
  }

  const game = await prisma.game.findUnique({
    where: { id: numericId },
    include: {
      game_genres: {
        include: {
          genre: true,
        },
      },
      reviews: {
        where: { is_archived: false },
        orderBy: { created_at: 'desc' },
        include: {
          user: true, 
        },
      },
    },
  });

  return game;
}

export default async function GameDetailsPage({ params }: PageProps) {
  const { gameid } = await params;
  const game = await getGameDetails(gameid);

  if (!game) {
    notFound();
  }

  const formattedDate = game.release_date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const genreName = game.game_genres[0]?.genre?.name || 'Uncategorized';

  // Fallback array of images related to the game.
  // In a production setup, you can save these in a "pictures" column/table in your DB,
  // but for now, we'll fall back to the main cover image or a few themed fallbacks.
  const galleryImages = [
    game.cover_image,
    // Add additional image fields from your database schema here if you have them!
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-16 py-4">

      {/* 1. HERO HEADER BANNER */}
      <div className="relative min-h-[450px] bg-brand-surface border border-white/5 rounded-lg overflow-hidden flex items-end p-8 md:p-12 shadow-2xl">
        {game.cover_image ? (
          /* Using standard HTML <img> to avoid Next.js width/height requirement headaches */
          <img 
            src={game.cover_image} 
            alt={`${game.title} cover`}
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 filter blur-[2px]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/10 to-brand-surface opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/85 to-transparent z-10" />

        <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary-button">
                {genreName}
              </span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                {formattedDate}
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl text-white font-bold leading-none">
              {game.title}
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light line-clamp-3">
              {game.description}
            </p>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t border-white/5 md:border-none z-30">
            <div className="bg-brand-bg/80 border border-white/10 px-4 py-3 rounded backdrop-blur-sm text-center shadow-lg min-w-[100px]">
              <div className="text-2xl md:text-4xl font-mono font-bold text-brand-primary-button">
                {game.rating_avg.toFixed(1)}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-0.5">
                Community
              </div>
            </div>
            <SaveGameButton gameId={gameid} initialSaved={false} />
          </div>
        </div>
      </div>

      {/* 2. REVIEWS CONSENSUS FEED */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
          <div>
            <h2 className="font-headline text-2xl text-white font-bold">Community Consensus</h2>
            <p className="text-xs text-gray-500 mt-0.5">Top rated reviews from the founding community.</p>
          </div>
          <Link href={`/reviews`} className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition">
            Read All Reviews
          </Link>
        </div>

        {game.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {game.reviews.map((rev) => (
              <div key={rev.id} className="bg-brand-surface border border-white/5 rounded p-6 flex flex-col justify-between space-y-4 shadow-md hover:border-brand-primary-button/20 transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-brand-secondary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {rev.user?.username ? rev.user.username[0] : 'U'}
                      </div>
                      <span className="font-bold text-gray-300">
                        {rev.user?.username || 'Anonymous User'}
                      </span>
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${rev.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rev.recommended ? '★ Recommend' : '✕ Avoid'}
                    </div>
                  </div>
                  <h4 className="text-white text-sm font-semibold leading-tight">{rev.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed font-light italic">
                    &ldquo;{rev.body}&rdquo;
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-gray-600 uppercase border-t border-white/5 pt-3">
                  <span>
                    {rev.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <LikeReviewButton reviewId={rev.id} initialLikes={rev.likes_count} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm bg-brand-surface rounded border border-white/5">
            No reviews have been published for this game yet.
          </div>
        )}
      </div>

      {/* 3. SIMPLIFIED GALLERY */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-headline text-2xl text-white font-bold">Visual Dossier</h2>
          <p className="text-xs text-gray-500 mt-0.5">Official snapshots for this title.</p>
        </div>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded border border-white/5 shadow-md aspect-video relative group bg-brand-surface"
              >
                {/* Standard HTML img tags ignore Next.js strict width checks—making them completely safe and bulletproof */}
                <img 
                  src={src} 
                  alt={`${game.title} gallery screenshot ${idx + 1}`} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm bg-brand-surface rounded border border-white/5">
            No pictures registered for this visual dossier.
          </div>
        )}
      </div>

    </div>
  );
}