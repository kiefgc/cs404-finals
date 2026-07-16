'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get('email'),
      password: form.get('password'),
      name: form.get('name'),
      handle: form.get('handle'),
      bio: form.get('bio') || undefined,
      location: form.get('location') || undefined,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-brand-surface border border-white/5 rounded overflow-hidden shadow-2xl">
        <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-[600px] bg-brand-tertiary flex items-end p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/95 via-brand-bg/40 to-transparent z-10"></div>
          <div className="relative z-20 max-w-sm">
            <h1 className="font-headline text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
              Join the<br />Community
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Create your account and start sharing your gaming critiques with fellow enthusiasts.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <h2 className="font-headline text-4xl text-white mb-2">Create Account</h2>
          <p className="text-sm text-gray-400 mb-10">Join the quest.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
              <input name="name" type="text" placeholder="Your name" required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Handle</label>
              <input name="handle" type="text" placeholder="@username" required minLength={2}
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input name="email" type="email" placeholder="name@archive.com" required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input name="password" type="password" placeholder="At least 8 characters" required minLength={8}
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bio (optional)</label>
              <textarea name="bio" rows={2} placeholder="Tell us about yourself"
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400" />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold uppercase tracking-widest py-3.5 rounded-sm transition mt-2 text-xs disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            Already have an account? <Link href="/login" className="text-brand-primary-light font-bold hover:text-white transition">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
