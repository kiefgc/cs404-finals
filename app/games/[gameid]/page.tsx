import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Ensure data stays fresh

interface GamePageProps {
  params: Promise<{ gameid: string }>;
}

async function getGameDetails(gameIdStr: string) {
  const gameId = parseInt(gameIdStr, 10);
  if (isNaN(gameId)) return null;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
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
      },
    },
  });

  if (!game) return null;

  // Defensive scale logic: If raw rating is <= 5, scale it to 10. Otherwise, preserve its scale.
  const displayRating = game.rating_avg <= 5 
    ? (game.rating_avg * 2).toFixed(1) 
    : game.rating_avg.toFixed(1);

  return {
    id: game.id,
    title: game.title,
    description: game.description,
    cover_image: game.cover_image,
    rating_avg: displayRating,
    release_date: game.release_date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    genres: game.game_genres.map((gg) => gg.genre.name),
    reviews: game.reviews.map((review) => {
      const diffTime = Math.abs(new Date().getTime() - review.created_at.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let relativeTime = `${diffDays} days ago`;
      if (diffDays === 1) relativeTime = "Yesterday";
      if (diffDays > 7) relativeTime = `${Math.floor(diffDays / 7)} weeks ago`;

      return {
        id: review.id,
        title: review.title,
        body: review.body,
        rating: review.rating,
        recommended: review.recommended,
        posted_ago: relativeTime.toUpperCase(),
        user: {
          id: review.user.id,
          name: review.user.name,
        },
        likes_count: review._count.likes,
      };
    }),
  };
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { gameid } = await params;
  const game = await getGameDetails(gameid);

  if (!game) notFound();

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      {/* 1. Hero Container Section with safely positioned absolute background */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-brand-surface/40">
        {/* Background Image Block - Increased opacity to 70% for much better visibility */}
        <div className="absolute inset-0 z-0">
          <img
            src={game.cover_image}
            alt={`${game.title} backdrop`}
            className="h-full w-full object-cover object-top opacity-70 transition-opacity duration-300"
          />
          {/* Adjusted gradients: Balanced fade-to-black so the artwork details are preserved */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content (Restricted inside bounds safely above background) */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-end">
            
            {/* Left Column: Context Metadata & Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-gray-400">
                <span className="text-gray-300">RELEASED {game.release_date.toUpperCase()}</span>
                {game.genres.map((genre) => (
                  <span key={genre} className="text-brand-primary-button/90">
                    · {genre.toUpperCase()}
                  </span>
                ))}
              </div>

              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {game.title}
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-gray-200 md:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {game.description}
              </p>
            </div>

            {/* Right Column: Score Box & CTA Button */}
            <div className="flex flex-row items-center gap-4 justify-start lg:flex-col lg:items-end lg:justify-end">
              {/* Score Badge */}
              <div className="flex h-20 w-20 flex-col items-center justify-center border border-white/10 bg-black/85 p-3 text-center rounded shadow-2xl">
                <span className="text-2xl font-bold text-[#96c2a6]">{game.rating_avg}</span>
                <span className="text-[8px] mt-1 font-semibold uppercase tracking-widest text-gray-400 animate-pulse">QuestLog Score</span>
              </div>

              {/* Action Button */}
              <button className="w-full max-w-[170px] rounded bg-[#a8cca4] py-3 text-center text-xs font-bold uppercase tracking-widest text-brand-bg transition duration-200 hover:bg-[#bce0b8] hover:shadow-lg hover:shadow-emerald-950/20">
                Add to Library
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Community Consensus / Reviews Grid */}
      <section className="mx-auto max-w-7xl py-16 space-y-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-5">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-white">Community Consensus</h2>
            <p className="mt-1 text-sm text-gray-500">Top-rated reviews from the QuestLog community.</p>
          </div>
          <Link
            href="/reviews"
            className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 hover:bg-white/5 transition"
          >
            Read All Reviews
          </Link>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {game.reviews.length > 0 ? (
            game.reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col justify-between rounded border border-white/5 bg-brand-surface p-6 shadow-xl"
              >
                <div className="space-y-4">
                  {/* User Profile Info & Score badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-secondary text-sm font-semibold uppercase text-white">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <Link
                          href={`/profile/${review.user.id}`}
                          className="text-sm font-semibold text-white hover:text-brand-primary-button transition"
                        >
                          {review.user.name}
                        </Link>
                        {/* Interactive Dynamic Star Rating system */}
                        <div className="flex text-xs text-[#a8cca4] mt-0.5">
                          {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                          {"☆".repeat(Math.max(0, 5 - Math.min(5, review.rating)))}
                        </div>
                      </div>
                    </div>

                    {/* Upvote/Helpful Badge */}
                    <div className="flex items-center gap-1 rounded bg-[#a8cca4]/10 px-2 py-1 text-xs text-[#a8cca4]">
                      <span>👍</span>
                      <span>{review.likes_count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Review Text Block */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{review.title}</p>
                    <p className="font-serif italic text-sm leading-relaxed text-gray-300 line-clamp-4">
                      "{review.body}"
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4 text-[9px] tracking-widest text-gray-500">
                  POSTED {review.posted_ago}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-2 rounded border border-dashed border-white/10 p-12 text-center text-sm text-gray-500">
              No reviews have been written for this game yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}