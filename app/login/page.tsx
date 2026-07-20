'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
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
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      router.push(from);
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
          <Image
            src="/monsterhunter.png"
            alt="Monster Hunter"
            fill
            className="absolute inset-0 object-cover z-0"
          />
          <div className="relative z-20 max-w-sm">
            <h1 className="font-headline text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
              Review Your Favorites<br />Now!
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Access your personal log of critical analysis, journey logs, and cultural deep-dives across the digital landscape.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <h2 className="font-headline text-4xl text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400 mb-10">Log in to your account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="name@archive.com"
                required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] text-brand-primary-light hover:text-white transition font-bold uppercase tracking-widest">Forgot?</Link>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold uppercase tracking-widest py-3.5 rounded-sm transition mt-2 text-xs disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Or</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <button type="button"
            className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white font-bold py-3.5 rounded-sm transition flex items-center justify-center gap-3"
          >
            <Image
              src="/google-logo.png"
              alt="Google logo"
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="text-[10px] uppercase tracking-widest font-normal text-gray-400">Continue with Google</span>
          </button>

          <p className="mt-8 text-center text-xs text-gray-500">
            New to the Log? <Link href="/register" className="text-brand-primary-light font-bold hover:text-white transition">Create an Account</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
