import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-white/5 bg-brand-bg sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-8">
          <Link href="/"
            className="font-headline text-3xl font-bold tracking-wide text-brand-primary-button hover:opacity-90 transition"
          >
            Website
          </Link>
          
          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm tracking-wider font-semibold uppercase text-gray-400">
            <Link href="/" className="hover:text-white transition text-white">Feed</Link>
            <Link href="/games" className="hover:text-white transition">Games</Link>
            <Link href="/journal" className="hover:text-white transition">Journal</Link>
          </nav>
        </div>

        {/* Right: Search Bar & Profile Stub */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative hidden sm:block w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-brand-surface border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-primary transition pl-8 placeholder:text-gray-600 text-gray-200"
            />
            <span className="absolute left-2.5 top-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
              </svg>
            </span>
          </div>

          {/* Profile Quick Link */}
          <Link 
            href="/profile/1" 
            className="p-1.5 rounded-full border border-white/10 hover:border-brand-primary bg-brand-surface text-gray-400 hover:text-white transition"
            title="View Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Link>
        </div>

      </div>
    </header>
  );
}