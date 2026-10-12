'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, ShieldCheck, Sparkles, Footprints, AlertCircle } from 'lucide-react';
import { AiHealthStatus } from '@/lib/ai-analyzer';

export default function Navbar() {
  const pathname = usePathname();
  const [aiHealth, setAiHealth] = useState<AiHealthStatus | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/health-ai')
      .then((res) => res.json())
      .then((data) => setAiHealth(data))
      .catch(() => setAiHealth(null));
  }, []);

  const navLinks = [
    { href: '/walk', label: 'Walk Mode', icon: Footprints },
    { href: '/observations', label: 'Map & Evidence', icon: MapPin },
    { href: '/privacy', label: 'Privacy & Safety', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f6]/90 backdrop-blur-md border-b border-[#e3ddd1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#1c3b2c] flex items-center justify-center text-[#fbf9f6] shadow-sm group-hover:bg-[#254d39] transition-colors">
            <Compass className="w-5 h-5 text-[#93b59b]" />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#14281e]">
              MonsoonMap
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-mono text-[#55635b] border border-[#ded8cb] px-1.5 py-0.5 rounded">
              Civic AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#e5ede7] text-[#14281e] font-semibold'
                    : 'text-[#55635b] hover:text-[#191f1b] hover:bg-[#f6f3ed]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1c3b2c]' : 'text-[#73827a]'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & AI Status Badge */}
        <div className="flex items-center gap-3">
          {/* AI Runtime Status Pill */}
          <div
            title={
              aiHealth?.isAvailable
                ? `Local open-source runtime active: ${aiHealth.configuredModel}`
                : 'Local model offline; running deterministic demo fallback mode'
            }
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              aiHealth?.isAvailable
                ? 'bg-[#eaf3f7] border-[#bed8e6] text-[#1b4d63]'
                : 'bg-[#f6f3ed] border-[#ded8cb] text-[#55635b]'
            }`}
          >
            {aiHealth?.isAvailable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#2c6e8a] animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-[#2c6e8a]" />
                <span className="font-mono text-[11px]">Gemma 3 Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#9aa8a1]" />
                <span className="font-mono text-[11px]">AI Demo Mode</span>
              </>
            )}
          </div>

          {/* Quick CTA button */}
          <Link
            href="/walk"
            className="flex items-center gap-1.5 bg-[#1c3b2c] hover:bg-[#254d39] text-[#fbf9f6] text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Footprints className="w-4 h-4 text-[#93b59b]" />
            <span>Start Walk</span>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-[#55635b] hover:bg-[#f6f3ed]"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e3ddd1] bg-[#fbf9f6] px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#e5ede7] text-[#14281e] font-semibold'
                    : 'text-[#55635b] hover:bg-[#f6f3ed]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#4f7358]" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#e3ddd1] flex items-center justify-between text-xs text-[#55635b] px-3">
            <span>AI Status:</span>
            <span className="font-mono">
              {aiHealth?.isAvailable ? 'Gemma 3 (Local Inference)' : 'Demo Fallback Mode'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
