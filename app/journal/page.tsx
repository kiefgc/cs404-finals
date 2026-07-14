'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GAMES } from '@/lib/mockData';

export default function JournalPage() {
  const currentUserId = '1';
  const [selectedGameId, setSelectedGameId] = useState<number>(GAMES[0]?.game_id ?? 0);
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80');
  const [title, setTitle] = useState('The Architecture of Loneliness');
  const [description, setDescription] = useState('A reflective essay on how silence, pacing, and environmental design shape emotional resonance.');
  const [content, setContent] = useState('Write your review here. Explain what stood out, what felt weak, and why the experience stayed with you.');
  const [recommended, setRecommended] = useState(true);

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
            href={`/profile/${currentUserId}/reviews`}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary-button transition hover:bg-white/10"
          >
            View my reviews
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="space-y-6 rounded-3xl border border-white/10 bg-brand-surface p-6 shadow-xl">
          <div className="space-y-2">
            <label htmlFor="game" className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Select Game
            </label>
            <select
              id="game"
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary"
            >
              <option value={0} disabled>
                Choose a game from the database
              </option>
              {GAMES.map((game) => (
                <option key={game.game_id} value={game.game_id}>
                  {game.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Only games already available in the database can be selected.</p>
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
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Name your review"
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
              Review content
            </label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share your full thoughts here"
              className="w-full rounded-2xl border border-white/10 bg-brand-bg px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-brand-primary"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Verdict
            </legend>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${recommended ? 'border-brand-primary bg-brand-primary/10 text-white' : 'border-white/10 bg-brand-bg text-gray-200'}`}>
                <input
                  type="radio"
                  name="recommended"
                  checked={recommended}
                  onChange={() => setRecommended(true)}
                  className="mr-3 inline-block h-4 w-4 accent-brand-primary"
                />
                Recommend
              </label>
              <label className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${recommended ? 'border-white/10 bg-brand-bg text-gray-200' : 'border-red-400/40 bg-red-500/10 text-red-200'}`}>
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

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-200 transition hover:bg-white/10"
            >
              Save draft
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-primary-button px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:opacity-90"
            >
              Publish review
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
                <p className="mt-2 text-sm leading-7 text-white">{recommended ? 'Recommended' : 'Not recommended'}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
