import Link from 'next/link';
import { getGameDetailById } from '@/lib/mockData';

export default async function GameDetailsPage({ params }: { params: Promise<{ gameid: string }> }) {
  const { gameid } = await params;
  const game = getGameDetailById(gameid);

  return (
    <div className="space-y-16 py-4">
      
      {/* 1. CINEMATIC HERO BACKDROP */}
      <div className="relative min-h-[450px] bg-brand-surface border border-white/5 rounded-lg overflow-hidden flex items-end p-8 md:p-12 shadow-2xl">
        {/* Placeholder gradient mimicking behind-the-scenes cover art overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-brand-tertiary/20 z-10" />
        <div className="absolute inset-0 flex items-center justify-center text-white/5 text-sm font-mono tracking-widest uppercase select-none">
          [ Giant Landscape Banner Artwork Background ]
        </div>

        {/* Hero Context Block */}
        <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                {game.release_date}
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl text-white font-bold leading-tight">
              {game.title}
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
              {game.description}
            </p>
          </div>

          {/* Call-to-Actions & Large Metric block */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t border-white/5 md:border-none">
            <div className="bg-brand-bg/80 border border-white/10 px-4 py-3 rounded backdrop-blur-xs text-center shadow-lg min-w-[100px]">
              <div className="text-2xl md:text-4xl font-mono font-bold text-brand-primary-button">
                {game.rating_avg.toFixed(1)}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-0.5">
                Community
              </div>
            </div>
            <button className="bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold uppercase tracking-widest px-6 py-3 rounded-sm transition text-xs shadow-md">
              Add To Library
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMMUNITY CONSENSUS (USER CRITIQUES) */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
          <div>
            <h2 className="font-headline text-2xl text-white font-bold">Community Consensus</h2>
            <p className="text-xs text-gray-500 mt-0.5">Top rated reviews from the founding community.</p>
          </div>
          <Link href="#" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary-button transition">
            Read All Reviews
          </Link>
        </div>

        {/* 2-Column Critique Layout Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {game.reviews.map((rev) => (
            <div key={rev.id} className="bg-brand-surface border border-white/5 rounded p-6 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-2">
                {/* Review Header Card details */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-secondary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {rev.user[0]}
                    </div>
                    <span className="font-bold text-gray-300">{rev.user}</span>
                  </div>
                  <div className={`text-sm font-bold ${rev.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rev.recommended ? 'Recommend' : 'Not Recommended'}
                  </div>
                </div>
                {/* Review Body */}
                <p className="text-gray-400 text-xs leading-relaxed font-light italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
              
              {/* Review Footer metadata stats */}
              <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-gray-600 uppercase border-t border-white/5 pt-3">
                <span>{rev.time}</span>
                <span className="flex items-center gap-1 text-brand-secondary">
                  👍 {rev.upvotes.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VISUAL DOSSIER (IMAGE GALLERY DISPLAY GRID) */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-headline text-2xl text-white font-bold">Visual Dossier</h2>
          <p className="text-xs text-gray-500 mt-0.5">Official captures from the Land of Shadow.</p>
        </div>

        {/* Composite Grid Arrangement Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 aspect-video bg-brand-surface border border-white/5 rounded flex items-center justify-center text-xs text-gray-600 font-mono shadow-md">
            [ Feature Panoramic Shot capture ]
          </div>
          <div className="aspect-video sm:aspect-auto bg-brand-surface border border-white/5 rounded flex items-center justify-center text-xs text-gray-600 font-mono shadow-md">
            [ Character Dossier Capture ]
          </div>
          <div className="aspect-video bg-brand-surface border border-white/5 rounded flex items-center justify-center text-xs text-gray-600 font-mono shadow-md">
            [ Atmospheric Setting Capture ]
          </div>
          <div className="sm:col-span-2 aspect-video sm:aspect-auto bg-brand-surface border border-white/5 rounded flex items-center justify-center text-xs text-gray-600 font-mono shadow-md">
            [ Combat Dynamic Capture ]
          </div>
        </div>
      </div>

    </div>
  );
}