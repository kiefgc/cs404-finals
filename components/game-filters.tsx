'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface GameFiltersProps {
  genres: string[];
}

export default function GameFilters({ genres }: GameFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'All';
  const sort = searchParams.get('sort') || 'title';
  const [localSearch, setLocalSearch] = useState(search);

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
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search Input Form */}
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

      {/* Genre Dropdown - Populated dynamically from DB */}
      <select 
        value={genre} 
        onChange={(e) => updateParam('genre', e.target.value)}
        className="bg-brand-surface border border-white/10 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-primary transition cursor-pointer"
      >
        <option value="All">All Genres</option>
        {genres.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* Sort Dropdown */}
      <select 
        value={sort} 
        onChange={(e) => updateParam('sort', e.target.value)}
        className="bg-brand-surface border border-white/10 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-primary transition cursor-pointer"
      >
        <option value="title">Sort: A-Z</option>
        <option value="rating">Sort: Rating</option>
        <option value="release_date">Sort: Newest</option>
      </select>
    </div>
  );
}