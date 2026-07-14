"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GAMES as INITIAL_GAMES, REVIEWS as INITIAL_REVIEWS, USERS as INITIAL_USERS } from '@/lib/mockData';
import type { Game, Review, User } from '@/types';

// Admin page supports three data sections: users, games, and reviews.
// It uses a client-side state copy of the mock data so edits are live
// for the current browser session without persisting to a backend.
type AdminSection = 'users' | 'games' | 'reviews';
type EditorMode = 'add' | 'edit';

// Discriminated union for editor state ensures TypeScript knows which
// fields are available for each section when rendering the form.
type EditorState =
  | { section: 'users'; mode: EditorMode; draft: Partial<User> }
  | { section: 'games'; mode: EditorMode; draft: Partial<Game> }
  | { section: 'reviews'; mode: EditorMode; draft: Partial<Review> };

const emptyUser: Partial<User> = {
  name: '',
  handle: '',
  bio: '',
  role: '',
  location: '',
  joined: '',
  gamesCount: 0,
  reviewsCount: 0,
  followersCount: 0,
  liked_games: [],
};

const emptyGame: Partial<Game> = {
  title: '',
  release_date: new Date().toISOString().slice(0, 10),
  rating_avg: 0,
  descript: '',
  genre_name: '',
  image_url: '',
};

const emptyReview: Partial<Review> = {
  review_title: '',
  body: '',
  rating: 3,
  recommended: true,
  date_created: new Date().toISOString().slice(0, 10),
  likes_count: 0,
};

// Utility used to copy the mock arrays so local edits don't mutate the original constants.
const cloneData = <T extends object>(items: T[]) => items.map((item) => ({ ...item } as T));

const sectionLabels: Record<AdminSection, string> = {
  users: 'Users',
  games: 'Games',
  reviews: 'Reviews',
};

const formatDate = (value: string | undefined) => {
  const date = value ? new Date(value) : new Date();
  return isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AdminDashboardPage() {
  // UI state for the admin page
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [search, setSearch] = useState('');

  // Local copies of the mock data arrays. These are editable within the admin panel.
  const [users, setUsers] = useState<User[]>(() => cloneData(INITIAL_USERS));
  const [games, setGames] = useState<Game[]>(() => cloneData(INITIAL_GAMES));
  const [reviews, setReviews] = useState<Review[]>(() => cloneData(INITIAL_REVIEWS));
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  const searchLower = search.toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        [user.name, user.handle, user.role, user.location, user.bio]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchLower)),
      ),
    [searchLower, users],
  );

  const filteredGames = useMemo(
    () =>
      games.filter((game) =>
        [game.title, game.genre_name, game.descript]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchLower)),
      ),
    [searchLower, games],
  );

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) =>
        [review.review_title, review.body, review.game_title, review.user_name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchLower)),
      ),
    [searchLower, reviews],
  );

  const currentItems = activeSection === 'users' ? filteredUsers : activeSection === 'games' ? filteredGames : filteredReviews;

  // Open the editor panel with the selected section and draft data.
  // We cast to the specific partial type for each section so the discriminated union is preserved.
  const openEditor = (section: AdminSection, mode: EditorMode, draft: Partial<User> | Partial<Game> | Partial<Review>) => {
    if (section === 'users') {
      setEditorState({ section, mode, draft: draft as Partial<User> });
      return;
    }

    if (section === 'games') {
      setEditorState({ section, mode, draft: draft as Partial<Game> });
      return;
    }

    setEditorState({ section, mode, draft: draft as Partial<Review> });
  };

  const closeEditor = () => {
    setEditorState(null);
  };

  // Update the currently open editor draft. The code must preserve the specific
  // draft type for the current section, so field updates remain type-safe.
  const handleDraftChange = (field: string, value: string | number | boolean) => {
    setEditorState((current) => {
      if (!current) return null;

      if (current.section === 'users') {
        return {
          ...current,
          draft: {
            ...current.draft,
            [field]: value,
          },
        };
      }

      if (current.section === 'games') {
        return {
          ...current,
          draft: {
            ...current.draft,
            [field]: value,
          },
        };
      }

      return {
        ...current,
        draft: {
          ...current.draft,
          [field]: value,
        },
      };
    });
  };

  const handleSectionAdd = () => {
    if (activeSection === 'users') {
      openEditor('users', 'add', { ...emptyUser });
      return;
    }

    if (activeSection === 'games') {
      openEditor('games', 'add', { ...emptyGame });
      return;
    }

    openEditor('reviews', 'add', {
      ...emptyReview,
      game_id: games[0]?.game_id,
      game_title: games[0]?.title,
      user_id: users[0]?.user_id,
      user_name: users[0]?.name,
    });
  };

  const nextId = (items: Array<{ game_id?: number; review_id?: number; user_id?: number }>, key: 'user_id' | 'game_id' | 'review_id') => {
    return Math.max(0, ...items.map((item) => Number(item[key] ?? 0))) + 1;
  };

  // Persist changes from the editor form into the local admin state.
  // This supports both adding new items and editing existing records.
  const saveEditor = () => {
    if (!editorState) return;

    if (editorState.section === 'users') {
      const draft = editorState.draft as Partial<User>;
      const nextUserId = nextId(users, 'user_id');

      if (editorState.mode === 'edit' && draft.user_id) {
        setUsers((current) => current.map((user) => (user.user_id === draft.user_id ? { ...user, ...draft } : user)));
      } else {
        setUsers((current) => [
          ...current,
          {
            user_id: nextUserId,
            name: draft.name ?? `User ${nextUserId}`,
            handle: draft.handle ?? `@user${nextUserId}`,
            bio: draft.bio ?? '',
            role: draft.role ?? '',
            location: draft.location ?? '',
            joined: draft.joined ?? `Joined ${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}`,
            gamesCount: Number(draft.gamesCount ?? 0),
            reviewsCount: Number(draft.reviewsCount ?? 0),
            followersCount: Number(draft.followersCount ?? 0),
            liked_games: draft.liked_games ?? [],
          },
        ]);
      }
    }

    if (editorState.section === 'games') {
      const draft = editorState.draft as Partial<Game>;
      const nextGameId = nextId(games, 'game_id');

      if (editorState.mode === 'edit' && draft.game_id) {
        setGames((current) => current.map((game) => (game.game_id === draft.game_id ? { ...game, ...draft } : game)));
      } else {
        setGames((current) => [
          ...current,
          {
            game_id: nextGameId,
            title: draft.title ?? `New Game ${nextGameId}`,
            release_date: draft.release_date ?? new Date().toISOString().slice(0, 10),
            rating_avg: Number(draft.rating_avg ?? 0),
            descript: draft.descript ?? '',
            genre_name: draft.genre_name ?? '',
            image_url: draft.image_url ?? '',
          },
        ]);
      }
    }

    if (editorState.section === 'reviews') {
      const draft = editorState.draft as Partial<Review>;
      const nextReviewId = nextId(reviews, 'review_id');

      if (editorState.mode === 'edit' && draft.review_id) {
        setReviews((current) => current.map((review) => (review.review_id === draft.review_id ? { ...review, ...draft } : review)));
      } else {
        setReviews((current) => [
          ...current,
          {
            review_id: nextReviewId,
            game_id: Number(draft.game_id ?? games[0]?.game_id ?? 0),
            game_title: draft.game_title ?? games.find((game) => game.game_id === draft.game_id)?.title ?? '',
            review_title: draft.review_title ?? `Review ${nextReviewId}`,
            body: draft.body ?? '',
            rating: Number(draft.rating ?? 0),
            recommended: Boolean(draft.recommended),
            user_id: Number(draft.user_id ?? users[0]?.user_id ?? 0),
            user_name: draft.user_name ?? users.find((user) => user.user_id === draft.user_id)?.name ?? '',
            date_created: draft.date_created ?? new Date().toISOString().slice(0, 10),
            likes_count: Number(draft.likes_count ?? 0),
          },
        ]);
      }
    }

    closeEditor();
  };

  const removeItem = (id: number | undefined) => {
    if (!id) return;
    if (activeSection === 'users') {
      setUsers((current) => current.filter((user) => user.user_id !== id));
      setReviews((current) => current.filter((review) => review.user_id !== id));
      return;
    }

    if (activeSection === 'games') {
      setGames((current) => current.filter((game) => game.game_id !== id));
      setReviews((current) => current.filter((review) => review.game_id !== id));
      return;
    }

    setReviews((current) => current.filter((review) => review.review_id !== id));
  };

  const startEdit = (item: User | Game | Review, section: AdminSection) => {
    if (section === 'users') {
      openEditor('users', 'edit', { ...(item as User) });
      return;
    }
    if (section === 'games') {
      openEditor('games', 'edit', { ...(item as Game) });
      return;
    }
    openEditor('reviews', 'edit', { ...(item as Review) });
  };

  const renderEditorForm = () => {
    if (!editorState) return null;

    const { section, mode, draft } = editorState;
    const title = mode === 'add' ? `Create new ${sectionLabels[section].slice(0, -1)}` : `Edit ${sectionLabels[section].slice(0, -1)}`;

    return (
      <section className="rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin editor</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={closeEditor} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-200 transition hover:bg-white/10">
              Cancel
            </button>
            <button type="button" onClick={saveEditor} className="rounded-full bg-brand-primary-button px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-bg transition hover:opacity-95">
              Save changes
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {section === 'users' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Name</span>
                  <input value={String(draft.name ?? '')} onChange={(event) => handleDraftChange('name', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Handle</span>
                  <input value={String(draft.handle ?? '')} onChange={(event) => handleDraftChange('handle', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Role</span>
                  <input value={String(draft.role ?? '')} onChange={(event) => handleDraftChange('role', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Location</span>
                  <input value={String(draft.location ?? '')} onChange={(event) => handleDraftChange('location', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Joined</span>
                  <input value={String(draft.joined ?? '')} onChange={(event) => handleDraftChange('joined', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Games Count</span>
                  <input type="number" value={Number(draft.gamesCount ?? 0)} onChange={(event) => handleDraftChange('gamesCount', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Reviews Count</span>
                  <input type="number" value={Number(draft.reviewsCount ?? 0)} onChange={(event) => handleDraftChange('reviewsCount', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Followers</span>
                  <input type="number" value={Number(draft.followersCount ?? 0)} onChange={(event) => handleDraftChange('followersCount', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <label className="space-y-2 text-sm text-gray-200">
                <span>Bio</span>
                <textarea value={String(draft.bio ?? '')} onChange={(event) => handleDraftChange('bio', event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
              </label>
            </>
          )}

          {section === 'games' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Title</span>
                  <input value={String(draft.title ?? '')} onChange={(event) => handleDraftChange('title', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Genre</span>
                  <input value={String(draft.genre_name ?? '')} onChange={(event) => handleDraftChange('genre_name', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Release Date</span>
                  <input type="date" value={String(draft.release_date ?? '')} onChange={(event) => handleDraftChange('release_date', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Average Score</span>
                  <input type="number" step="0.1" value={Number(draft.rating_avg ?? 0)} onChange={(event) => handleDraftChange('rating_avg', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Cover URL</span>
                  <input value={String(draft.image_url ?? '')} onChange={(event) => handleDraftChange('image_url', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <label className="space-y-2 text-sm text-gray-200">
                <span>Description</span>
                <textarea value={String(draft.descript ?? '')} onChange={(event) => handleDraftChange('descript', event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
              </label>
            </>
          )}

          {section === 'reviews' && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Review Title</span>
                  <input value={String(draft.review_title ?? '')} onChange={(event) => handleDraftChange('review_title', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Game</span>
                  <select value={draft.game_id ?? games[0]?.game_id} onChange={(event) => {
                    const gameId = Number(event.target.value);
                    const foundGame = games.find((game) => game.game_id === gameId);
                    handleDraftChange('game_id', gameId);
                    handleDraftChange('game_title', foundGame?.title ?? '');
                  }} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary">
                    {games.map((game) => (
                      <option key={game.game_id} value={game.game_id}>{game.title}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Reviewer</span>
                  <select value={draft.user_id ?? users[0]?.user_id} onChange={(event) => {
                    const userId = Number(event.target.value);
                    const foundUser = users.find((user) => user.user_id === userId);
                    handleDraftChange('user_id', userId);
                    handleDraftChange('user_name', foundUser?.name ?? '');
                  }} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary">
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>{user.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Rating</span>
                  <input type="number" min={0} max={5} value={Number(draft.rating ?? 0)} onChange={(event) => handleDraftChange('rating', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Recommended</span>
                  <select value={draft.recommended ? 'yes' : 'no'} onChange={(event) => handleDraftChange('recommended', event.target.value === 'yes')} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Date</span>
                  <input type="date" value={String(draft.date_created ?? new Date().toISOString().slice(0, 10))} onChange={(event) => handleDraftChange('date_created', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Likes</span>
                  <input type="number" value={Number(draft.likes_count ?? 0)} onChange={(event) => handleDraftChange('likes_count', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Short Text</span>
                  <textarea value={String(draft.body ?? '')} onChange={(event) => handleDraftChange('body', event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none focus:border-brand-primary" />
                </label>
              </div>
            </>
          )}
        </div>
      </section>
    );
  };

  const renderTable = () => {
    if (activeSection === 'users') {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-brand-surface">
          <table className="min-w-full border-separate border-spacing-0 text-sm text-left text-gray-200">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-gray-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Handle</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Reviews</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-4">{user.name}</td>
                  <td className="px-5 py-4 text-brand-primary-light">{user.handle}</td>
                  <td className="px-5 py-4">{user.role}</td>
                  <td className="px-5 py-4">{user.location}</td>
                  <td className="px-5 py-4">{user.reviewsCount ?? 0}</td>
                  <td className="px-5 py-4 space-x-2">
                    <button type="button" onClick={() => startEdit(user, 'users')} className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary-button transition hover:bg-white/10">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeItem(user.user_id)} className="rounded-full bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'games') {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-brand-surface">
          <table className="min-w-full border-separate border-spacing-0 text-sm text-left text-gray-200">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-gray-400">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Genre</th>
                <th className="px-5 py-4">Release</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game) => (
                <tr key={game.game_id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-4">{game.title}</td>
                  <td className="px-5 py-4">{game.genre_name}</td>
                  <td className="px-5 py-4">{formatDate(game.release_date)}</td>
                  <td className="px-5 py-4">{game.rating_avg.toFixed(1)}</td>
                  <td className="px-5 py-4 space-x-2">
                    <button type="button" onClick={() => startEdit(game, 'games')} className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary-button transition hover:bg-white/10">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeItem(game.game_id)} className="rounded-full bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-brand-surface">
        <table className="min-w-full border-separate border-spacing-0 text-sm text-left text-gray-200">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-gray-400">
            <tr>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Game</th>
              <th className="px-5 py-4">Reviewer</th>
              <th className="px-5 py-4">Rating</th>
              <th className="px-5 py-4">Recommended</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.review_id} className="border-t border-white/5 hover:bg-white/5 transition">
                <td className="px-5 py-4">{review.review_title}</td>
                <td className="px-5 py-4">{review.game_title}</td>
                <td className="px-5 py-4">{review.user_name}</td>
                <td className="px-5 py-4">{review.rating ?? '-'}</td>
                <td className="px-5 py-4">{review.recommended ? 'Yes' : 'No'}</td>
                <td className="px-5 py-4 space-x-2">
                  <button type="button" onClick={() => startEdit(review, 'reviews')} className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary-button transition hover:bg-white/10">
                    Edit
                  </button>
                  <button type="button" onClick={() => removeItem(review.review_id)} className="rounded-full bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-brand-surface p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin dashboard</p>
            <h1 className="mt-3 text-4xl font-headline text-white font-bold sm:text-5xl">Manage users, games, and reviews</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
              This admin panel lets you inspect the current mock site data, update entries, create new records, and remove stale content. These changes are held in browser state for the current session.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10">
              Back to site
            </Link>
            <button type="button" onClick={handleSectionAdd} className="inline-flex items-center justify-center rounded-full bg-brand-primary-button px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-bg transition hover:opacity-95">
              Add {sectionLabels[activeSection].slice(0, -1)}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Sections</p>
            <div className="mt-4 flex flex-col gap-3">
              {(['users', 'games', 'reviews'] as AdminSection[]).map((section) => (
                <button key={section} type="button" onClick={() => { setActiveSection(section); setSearch(''); closeEditor(); }} className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === section ? 'bg-brand-primary-button text-brand-bg' : 'bg-white/5 text-gray-200 hover:bg-white/10'}`}>
                  {sectionLabels[section]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Summary</p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Users</p>
                <p className="mt-2 text-3xl font-semibold text-white">{users.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Games</p>
                <p className="mt-2 text-3xl font-semibold text-white">{games.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Reviews</p>
                <p className="mt-2 text-3xl font-semibold text-white">{reviews.length}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Active collection</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{sectionLabels[activeSection]}</h2>
              <p className="mt-1 text-sm text-gray-400">
                {currentItems.length} {sectionLabels[activeSection].toLowerCase()} match the current filter.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:w-72">
                <span className="sr-only">Search section</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${sectionLabels[activeSection]}`} className="w-full rounded-3xl border border-white/10 bg-brand-bg px-4 py-3 pr-10 text-sm text-white outline-none focus:border-brand-primary" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              </label>
              <button type="button" onClick={handleSectionAdd} className="rounded-full bg-brand-primary-button px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-bg transition hover:opacity-95 sm:px-5">
                Add {sectionLabels[activeSection].slice(0, -1)}
              </button>
            </div>
          </div>

          {renderEditorForm()}
          {renderTable()}
        </div>
      </div>
    </div>
  );
}
