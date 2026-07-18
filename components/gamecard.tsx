import Link from 'next/link';
import { Game } from '@/types';

interface GameCardProps {
  // Using 'any' briefly to safely handle both database models and custom mapped types
  game: any; 
}

export default function GameCard({ game }: GameCardProps) {
  // Extract Year cleanly for metadata display
  const releaseYear = game.release_date ? new Date(game.release_date).getFullYear() : 'N/A';
  
  // Defensive ID lookup: support both game_id and standard id formats
  const targetId = game.game_id ?? game.id;

  // Safe decimal styling fallback
  const ratingDisplay = typeof game.rating_avg === 'number' 
    ? game.rating_avg.toFixed(1) 
    : parseFloat(game.rating_avg || 0).toFixed(1);

  return (
    <Link href={`/games/${targetId}`} className="group block w-full">
      {/* Aspect Ratio Container for Cover Art */}
      <div className="relative aspect-[2/3] w-full bg-brand-surface rounded border border-white/5 overflow-hidden transition-all duration-300 group-hover:border-brand-primary-button/30 group-hover:scale-[1.015] shadow-md group-hover:shadow-brand-primary-button/5">
        
        {/* Visual Background Fallback / Image Block */}
        {game.cover_image ? (
          <img 
            src={game.cover_image} 
            alt={game.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-tertiary/20 to-brand-tertiary flex items-center justify-center p-4">
            <span className="text-gray-600 font-mono text-[11px] text-center uppercase tracking-wider opacity-60">
              {game.title}
            </span>
          </div>
        )}

        {/* Floating Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-brand-bg/90 border border-white/10 px-2 py-0.5 rounded-sm backdrop-blur-xs">
          <span className="font-mono text-xs font-bold text-brand-primary-button tracking-tighter">
            {ratingDisplay}
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