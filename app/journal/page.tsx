'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';

// Adjusted interface to use standard 'id' based on database schemas
interface Game {
  id: number | string;
  title: string;
}

export default function JournalPage() {
  const router = useRouter();
  
  // State management
  const [games, setGames] = useState<Game[]>([]); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [gameId, setGameId] = useState<string | number>(''); 
  const [rating, setRating] = useState(1); // Matches your starting visual rating of 1/10
  
  // Dynamic user-submitted image field
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingGames, setFetchingGames] = useState(true);

  // Fetch live games list on mount
  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch('/api/games?limit=50&sort=title&order=asc');
        if (!res.ok) throw new Error('Could not retrieve games database.');
        
        const data = await res.json();
        const gamesList = data.games || [];
        
        setGames(gamesList);
        if (gamesList.length > 0) {
          // Use 'id' dynamically from the database
          const firstGameId = gamesList[0].id || gamesList[0].game_id;
          if (firstGameId) setGameId(firstGameId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch games list.');
      } finally {
        setFetchingGames(false);
      }
    }
    fetchGames();
  }, []);

  // Find currently selected game to display the tag inside the live preview card
  const selectedGame = games.find(g => (g.id === gameId || (g as any).game_id === gameId));

  // Handle Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gameId) {
      setError('Please select a game.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          content,
          recommended,
          game_id: Number(gameId),
          rating,
          thumbnail, // Sends the user-defined image URL to your backend database
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit journal entry.');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setContent('');
      
      setTimeout(() => {
        router.push('/journal'); 
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-gray-200 font-body">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Form Column */}
        <div className="bg-brand-surface border border-neutral-900 rounded-xl p-6 shadow-2xl">
          <div className="mb-6">
            <Link href="/journal" className="text-xs font-semibold uppercase tracking-wider text-brand-primary-button hover:underline">
              ← Back to Journals
            </Link>
            <h1 className="text-3xl font-headline font-bold text-white mt-2">Create Journal Entry</h1>
            <p className="text-gray-400 text-sm font-light mt-1">Document your thoughts, rating, and gameplay experience.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-sm mb-4">
              Journal submitted successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Game Selector Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Select Game
              </label>
              {fetchingGames ? (
                <div className="h-11 bg-brand-surface-elevated rounded-lg animate-pulse flex items-center px-3 text-xs text-gray-500">
                  Loading games database...
                </div>
              ) : (
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-brand-primary-button text-sm"
                  required
                >
                  {games.length === 0 ? (
                    <option value="">No games found in database</option>
                  ) : (
                    games.map((game) => {
                      // Fallback support for schemas with game_id vs id
                      const gId = game.id ?? (game as any).game_id;
                      return (
                        <option key={gId} value={gId}>
                          {game.title}
                        </option>
                      );
                    })
                  )}
                </select>
              )}
            </div>

            {/* Custom Review Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Custom Review Image (URL)
              </label>
              <input
                type="url"
                placeholder="https://example.com/your-awesome-screenshot.jpg"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-primary-button text-sm"
              />
            </div>

            {/* Entry Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Entry Title
              </label>
              <input
                type="text"
                placeholder="e.g., Finally beat the first boss!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-primary-button text-sm"
                required
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Short Description
              </label>
              <input
                type="text"
                placeholder="A brief summary of this entry..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-primary-button text-sm"
                required
              />
            </div>

            {/* Rating and Recommendation Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-brand-primary-button text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Recommend?
                </label>
                <button
                  type="button"
                  onClick={() => setRecommended(!recommended)}
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors text-sm border ${
                    recommended 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                      : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                  }`}
                >
                  {recommended ? '👍 Yes' : '👎 No'}
                </button>
              </div>
            </div>

            {/* Journal Content Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Journal thoughts
              </label>
              <textarea
                rows={6}
                placeholder="Write down your adventure notes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-brand-surface-elevated border border-neutral-800 rounded-lg px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-primary-button resize-none text-sm leading-relaxed"
                required
              />
            </div>

            {/* Submit Button (Uses your theme green color var) */}
            <button
              type="submit"
              disabled={loading || fetchingGames}
              className="w-full bg-brand-primary-button hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? 'Submitting Entry...' : 'Post Entry'}
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="sticky top-12 h-full bg-brand-surface border border-neutral-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="relative h-56 bg-neutral-900">
            {/* Renders the user's customized image URL directly */}
            <img
              src={thumbnail || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'}
              alt="Custom Review Cover"
              className="w-full h-full object-cover opacity-70"
              onError={(e) => {
                // Fallback in case of broken URLs
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-primary-light bg-brand-primary/80 border border-brand-primary-light/20 px-3 py-1 rounded-full">
                {selectedGame ? selectedGame.title : 'No Game Selected'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-grow">
            <div>
              <div className="flex justify-between items-start gap-4">
                {/* Added break-words */}
                <h2 className="text-2xl font-headline font-bold text-white leading-tight break-words max-w-[80%]">
                  {title || 'Your Entry Title Preview'}
                </h2>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-semibold text-yellow-500">★ {rating}/10</span>
                </div>
              </div>
              {/* Added break-words */}
              <p className="text-sm text-gray-400 mt-1.5 italic break-words">
                {description || 'This is where your short description snippet will show...'}
              </p>
            </div>

            <hr className="border-neutral-800" />

            {/* Added break-words */}
            <div className="text-sm text-gray-300 leading-relaxed min-h-[120px] whitespace-pre-wrap break-words">
              {content || 'Start writing to see your live entry render here...'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}