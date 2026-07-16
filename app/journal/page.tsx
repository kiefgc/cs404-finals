'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { ALL_GAMES } from '@/lib/mockData';

export default function JournalPage() {
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [gameId, setGameId] = useState(201);
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !content) {
      setError('Title and review content are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId,
          title,
          body: content,
          rating,
          recommended,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to publish review.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reviews');
        router.refresh();
      }, 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] py-12">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="font-headline text-3xl text-white font-bold">Review Published!</h2>
          <p className="text-gray-400 text-sm">Redirecting you to the reviews feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <header className="rounded-3xl border border-white/10 bg-brand-surface p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Journal</p>
            <h1 className="mt-3 text-4xl font-headline text-white font-bold sm:text-5xl">
              Create a review
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              Build a polished review entry with a standout image, a concise summary, the full article, and a verdict that readers can scan instantly.
            </p>
          </div>
          <Link
            href="/profile/1/reviews"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
          >
            View my reviews
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">

          <div className="space-y-2">
            <label htmlFor="game" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Game
            </label>
            <select
              id="game"
              value={gameId}
              onChange={(e) => setGameId(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary cursor-pointer"
            >
              {ALL_GAMES.map(g => (
                <option key={g.game_id} value={g.game_id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="thumbnail" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Thumbnail image
            </label>
            <input
              id="thumbnail"
              type="url"
              value={thumbnail}
              onChange={(event) => setThumbnail(event.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Name your review"
              required
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Short description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Summarize the review in a sentence or two"
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Review content *
            </label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share your full thoughts here"
              required
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rating" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Rating (1-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="rating"
                type="range"
                min={1}
                max={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="flex-1 accent-brand-primary-button"
              />
              <span className="text-sm font-bold text-brand-primary-button w-6 text-center">{rating}</span>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Verdict
            </legend>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition cursor-pointer ${recommended ? 'border-brand-primary bg-brand-primary/10 text-white' : 'border-white/10 bg-brand-bg text-gray-200'}`}>
                <input
                  type="radio"
                  name="recommended"
                  checked={recommended}
                  onChange={() => setRecommended(true)}
                  className="mr-3 inline-block h-4 w-4 accent-brand-primary"
                />
                Recommend
              </label>
              <label className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition cursor-pointer ${recommended ? 'border-white/10 bg-brand-bg text-gray-200' : 'border-red-400/40 bg-red-500/10 text-red-200'}`}>
                <input
                  type="radio"
                  name="recommended"
                  checked={!recommended}
                  onChange={() => setRecommended(false)}
                  className="mr-3 inline-block h-4 w-4 accent-red-400"
                />
                Do not recommend
              </label>
            </div>
          </fieldset>

          {error && (
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="rounded-full bg-brand-primary-button px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Publishing...' : 'Publish review'}
            </button>
          </div>
        </form>

        <aside className="rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Preview</p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-brand-bg">
            <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }} />
            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-xl font-semibold text-white">{title || 'Untitled review'}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-400">{description || 'Add a short description to introduce the review.'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Review</p>
                <p className="mt-2 text-sm leading-7 text-gray-300">{content || 'Your full review will appear here.'}</p>
              </div>

              <div className={`rounded-2xl border p-4 ${recommended ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-300">Verdict</p>
                <p className="mt-2 text-sm leading-7 text-white">{recommended ? 'Recommended' : 'Not recommended'} · {rating}/10</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
