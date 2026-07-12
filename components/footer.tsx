import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-bg border-t border-white/5 mt-20 px-6 py-12 text-xs text-gray-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Branding & Vision */}
        <div className="max-w-xs">
          <h3 className="font-headline text-2xl font-bold text-brand-primaryLight mb-2">QuestLog</h3>
          <p className="leading-relaxed">
            Elevating the discourse of digital play through rigorous analysis and discerning critique.
          </p>
          <p className="mt-4 text-[10px] text-gray-600">
            © {currentYear} QuestLog Editorial. All rights reserved.
          </p>
        </div>

        {/* Structured Navigation Columns */}
        <div className="flex gap-16">
          <div>
            <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3 text-[11px]">Editorial</h4>
            <ul className="space-y-2">
              <li><Link href="/reviews" className="hover:text-brand-primaryLight transition">Reviews</Link></li>
              <li><Link href="/features" className="hover:text-brand-primaryLight transition">Features</Link></li>
              <li><Link href="/ethics" className="hover:text-brand-primaryLight transition">Ethics Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3 text-[11px]">Archive</h4>
            <ul className="space-y-2">
              <li><Link href="/newsletter" className="hover:text-brand-primaryLight transition">Newsletter</Link></li>
              <li><Link href="/podcasts" className="hover:text-brand-primaryLight transition">Podcasts</Link></li>
              <li><Link href="/contact" className="hover:text-brand-primaryLight transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3 text-[11px]">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-brand-primaryLight transition">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-primaryLight transition">Terms</Link></li>
              <li><Link href="/about" className="hover:text-brand-primaryLight transition">About</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}