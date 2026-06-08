'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4d4] to-[#0070f3] flex items-center justify-center shadow-lg shadow-[#00d4d4]/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M4 6.5L6 8.5L10 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">ATS Scanner</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {[['/', 'Home'], ['/scanner', 'Scanner']].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? 'text-white bg-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/scanner"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-[#0a0a1a] transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00d4d4, #0070f3)' }}
        >
          Scan Now
        </Link>
      </div>
    </header>
  );
}
