'use client';

import { useState } from 'react';

interface SaveGameButtonProps {
  gameId: string;
  initialSaved: boolean;
}

export default function SaveGameButton({ gameId, initialSaved }: SaveGameButtonProps) {
  const [inLibrary, setInLibrary] = useState(initialSaved);

  async function toggleLibrary() {
    try {
      const res = await fetch(`/api/games/${gameId}/save`, { method: 'POST' });
      if (!res.ok) return;
      setInLibrary((prev) => !prev);
    } catch {
      // silently fail
    }
  }

  return (
    <button 
      onClick={toggleLibrary}
      className={`font-bold uppercase tracking-widest px-6 py-3 rounded-sm transition text-xs shadow-md cursor-pointer ${
        inLibrary 
          ? 'bg-white/10 text-gray-300 border border-white/20' 
          : 'bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg'
      }`}
    >
      {inLibrary ? 'In Library' : 'Add To Library'}
    </button>
  );
}