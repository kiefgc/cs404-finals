import Link from 'next/link';
import { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  // Extract Year cleanly for metadata display
  const releaseYear = new Date(game.release_date).getFullYear();

  return (
    <Link href={`/games/${game.game_id}`} className="group block w-full">
      {/* Aspect Ratio Container for Cover Art */}
      <div className="relative aspect-[2/3] w-full bg-brand-surface rounded border border-white/5 overflow-hidden transition-all duration-300 group-hover:border-brand-primary-button/30 group-hover:scale-[1.015] shadow-md group-hover:shadow-brand-primary-button/5">
        
        {/* Placeholder Box for Art Cover — will be replaced with <Image> once APIs go live */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-tertiary/20 to-brand-tertiary flex items-center justify-center p-4">
          <span className="text-gray-600 font-mono text-[11px] text-center uppercase tracking-wider opacity-60">
            {game.title}
          </span>
        </div>

        {/* Floating Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-brand-bg/90 border border-white/10 px-2 py-0.5 rounded-sm backdrop-blur-xs">
          <span className="font-mono text-xs font-bold text-brand-primary-button tracking-tighter">
            {game.rating_avg.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Typography Metadata Block */}
      <div className="mt-3 space-y-0.5">
        <h4 className="font-headline text-lg text-white font-medium group-hover:text-brand-primary-button transition duration-200 truncate leading-snug">
          {game.title}
        </h4>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-gray-500">
          <span>Released {releaseYear}</span>
          {game.genre_name && (
            <>
              <span className="text-white/10">•</span>
              <span className="text-brand-secondary/80">{game.genre_name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}