'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import GameCard from '@/components/gamecard';
import { ALL_GAMES } from '@/lib/mockData';

const GENRES = ['All', 'Action', 'Exploration', 'Management', 'Narrative Adventure', 'Platformer', 'Puzzle', 'Racing', 'Simulation', 'Strategy', 'Survival'];

function GamesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'All';
  const sort = searchParams.get('sort') || 'title';
  const [localSearch, setLocalSearch] = useState(search);

  const filtered = useMemo(() => {
    let games = [...ALL_GAMES];

    if (search) {
      const q = search.toLowerCase();
      games = games.filter(g => g.title.toLowerCase().includes(q));
    }

    if (genre && genre !== 'All') {
      games = games.filter(g => g.genre_name === genre);
    }

    switch (sort) {
      case 'rating':
        games.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      case 'release_date':
        games.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      case 'title':
      default:
        games.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return games;
  }, [search, genre, sort]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/games?${params.toString()}`);
  }

  function handleLocalSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParam('search', localSearch);
  }

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
          <span className="font-semibold text-white">{filtered.length}</span> titles available
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <form onSubmit={handleLocalSearch} className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-brand-surface border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-primary transition pl-8 placeholder:text-gray-600 text-gray-200"
          />
          <button type="submit" className="absolute left-2.5 top-2.5 text-gray-600 hover:text-brand-primary-button transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
            </svg>
          </button>
        </form>

        <select value={genre} onChange={(e) => updateParam('genre', e.target.value)}
          className="bg-brand-surface border border-white/10 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-primary transition cursor-pointer">
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
          className="bg-brand-surface border border-white/10 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-primary transition cursor-pointer">
          <option value="title">Sort: A-Z</option>
          <option value="rating">Sort: Rating</option>
          <option value="release_date">Sort: Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((game) => (
          <div
            key={game.game_id}
            className="rounded border border-white/10 bg-brand-surface p-3 shadow-lg shadow-black/10"
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12 text-sm">No games found matching your filters.</p>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500 text-sm">Loading games...</div>}>
      <GamesContent />
    </Suspense>
  );
}
