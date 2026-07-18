import { Suspense } from 'react';
import GameCard from '@/components/gamecard';
import GameFilters from '@/components/game-filters';
import { prisma } from '@/lib/prisma';
import { Game } from '@/types';

export const revalidate = 0; // Ensure data stays fully fresh

interface PageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string;
    sort?: string;
  }>;
}

// Fixed: Explicitly typed as an already-resolved object to prevent Turbopack/Next.js hydration mismatches
async function GamesContent({ searchParams }: { searchParams: { search?: string; genre?: string; sort?: string } }) {
  const search = searchParams.search || '';
  const genre = searchParams.genre || 'All';
  const sort = searchParams.sort || 'title';

  // 1. Fetch available genres dynamically from the database
  const dbGenres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
  const genreList = dbGenres.map(g => g.name);

  // 2. Build our database filters dynamically based on search parameters
  const whereClause: any = {};

  if (search) {
    whereClause.title = {
      contains: search,
      mode: 'insensitive', // Safe, case-insensitive title matching
    };
  }

  if (genre && genre !== 'All') {
    whereClause.game_genres = {
      some: {
        genre: {
          name: genre,
        },
      },
    };
  }

  // 3. Match the UI sort filters to relational Prisma sorting orders
  let orderByClause: any = { title: 'asc' };
  if (sort === 'rating') {
    orderByClause = { rating_avg: 'desc' };
  } else if (sort === 'release_date') {
    orderByClause = { release_date: 'desc' };
  }

  // 4. Query the database
  const dbGames = await prisma.game.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      game_genres: {
        include: {
          genre: true,
        },
      },
    },
  });

  // 5. Transform raw Prisma schema rows into our component types
  const games: Game[] = dbGames.map((game) => ({
    game_id: game.id,
    title: game.title,
    release_date: game.release_date.toISOString(),
    cover_image: game.cover_image,
    description: game.description,
    rating_avg: game.rating_avg,
    genre_name: game.game_genres[0]?.genre?.name || '',
  }));

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-brand-primary-button">
            Library
          </p>
          <h1 className="font-headline text-4xl font-bold text-white md:text-5xl">
            View All Games
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Browse the full catalog of registered titles in a gallery layout. Each portrait opens the individual game profile.
          </p>
        </div>

        <div className="rounded border border-white/10 bg-brand-surface px-4 py-3 text-sm text-gray-400">
          <span className="font-semibold text-white">{games.length}</span> titles available
        </div>
      </div>

      {/* Interactive Filters (Client Component) */}
      <GameFilters genres={genreList} />

      {/* Database-sourced Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <div
              key={game.game_id}
              className="rounded border border-white/10 bg-brand-surface p-3 shadow-lg shadow-black/10"
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12 text-sm">
          No games found matching your filters.
        </p>
      )}
    </div>
  );
}

export default async function GamesPage({ searchParams }: PageProps) {
  // Safe resolution of params outside the rendering content shell
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500 text-sm">Loading games...</div>}>
      <GamesContent searchParams={resolvedParams} />
    </Suspense>
  );
}