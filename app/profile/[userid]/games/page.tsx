import Link from 'next/link';
import GameCard from '@/components/gamecard';
import { getUserById, getUserLikedGames } from '@/lib/mockData';

export default async function ProfileLikedGamesPage({ params }: { params: Promise<{ userid: string }> }) {
  const { userid } = await params;
  const profileUser = getUserById(userid);
  const userLikedGames = getUserLikedGames(userid);

  return (
    <div className="space-y-8 py-2">
      <header className="rounded-3xl border border-white/10 bg-brand-surface p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-brand-primary-button">
              Profile Library
            </p>
            <h1 className="mt-3 font-headline text-4xl font-bold text-white sm:text-5xl">
              Games {profileUser.name.split(' ')[0]} likes
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              A curated view of the titles this profile has marked as favorites, styled like the main game catalog.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/profile/${userid}`}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
            >
              Back to profile
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Favorite Library</p>
          <h2 className="mt-2 text-3xl font-headline font-bold text-white">
            Curated favorites
          </h2>
        </div>
        <div className="rounded border border-white/10 bg-brand-surface px-4 py-3 text-sm text-gray-400">
          <span className="font-semibold text-white">{userLikedGames.length}</span> liked titles
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userLikedGames.map((game) => (
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
