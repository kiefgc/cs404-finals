import Link from 'next/link';
import { notFound } from 'next/navigation';
import GameCard from '@/components/gamecard';
import { prisma } from '@/lib/prisma';
import { Game } from '@/types';

export const revalidate = 0;

interface ProfileLikedGamesPageProps {
  params: Promise<{ userid: string }>;
}

async function getLikedGamesData(userIdStr: string) {
  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) return null;

  // 1. Fetch user to display personal layout headings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) return null;

  // 2. Fetch all games saved/liked by this user
  const dbSavedGames = await prisma.savedGame.findMany({
    where: { user_id: userId },
    orderBy: { game_id: 'desc' },
    include: {
      game: {
        include: {
          game_genres: {
            include: {
              genre: true,
            },
          },
        },
      },
    },
  });

  // Map to unified Game types expected by <GameCard />
  const userLikedGames: Game[] = dbSavedGames.map((sg) => {
    const primaryGenre = sg.game.game_genres[0]?.genre?.name || '';
    return {
      game_id: sg.game.id,
      title: sg.game.title,
      release_date: sg.game.release_date.toISOString(),
      cover_image: sg.game.cover_image || null,
      description: sg.game.description,
      rating_avg: sg.game.rating_avg,
      genre_name: primaryGenre,
    };
  });

  return {
    profileUser: {
      name: user.name,
    },
    userLikedGames,
  };
}

export default async function ProfileLikedGamesPage({ params }: ProfileLikedGamesPageProps) {
  const { userid } = await params;
  const data = await getLikedGamesData(userid);

  if (!data) notFound();

  const { profileUser, userLikedGames } = data;

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

      {userLikedGames.length > 0 ? (
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
      ) : (
        <div className="text-center py-12 bg-brand-surface/50 rounded-3xl border border-white/5 text-gray-500 text-sm">
          No liked games in this catalog.
        </div>
      )}
    </div>
  );
}