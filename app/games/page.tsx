import GameCard from '@/components/gamecard';
import { ALL_GAMES } from '@/lib/mockData';

export default function GamesPage() {
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
          <span className="font-semibold text-white">{ALL_GAMES.length}</span> titles available
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ALL_GAMES.map((game) => (
          <div
            key={game.game_id}
            className="rounded border border-white/10 bg-brand-surface p-3 shadow-lg shadow-black/10"
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  );
}
