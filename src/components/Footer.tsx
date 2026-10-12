import React from 'react';
import Link from 'next/link';
import { Compass, Footprints, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print border-t border-[#e3ddd1] bg-[#f6f3ed] text-[#55635b] text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#1c3b2c] flex items-center justify-center text-[#fbf9f6]">
                <Compass className="w-4 h-4 text-[#93b59b]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#14281e]">MonsoonMap</span>
            </div>
            <p className="text-xs text-[#73827a] max-w-md leading-relaxed">
              Walk your streets. Expose the problems. Make the evidence count. An open-weight civic tool built for the Hacktoberfest x DEV Week 1 “Touch Grass” challenge.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#1c3b2c] bg-[#e5ede7] px-2.5 py-1 rounded-md border border-[#c2dec9]">
              <Footprints className="w-3.5 h-3.5 text-[#4f7358]" />
              <span>Touch Grass Challenge: Outdoor Observation First</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-3">
              App Routes
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/walk" className="hover:text-[#14281e] transition-colors">
                  Outdoor Walk Mode
                </Link>
              </li>
              <li>
                <Link href="/observations" className="hover:text-[#14281e] transition-colors">
                  Observation Map & Timeline
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#14281e] transition-colors">
                  Privacy & Field Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Ethics */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-3">
              Safety & Ethics
            </h4>
            <p className="text-xs text-[#73827a] leading-relaxed">
              Never wade into floodwaters or approach fallen utilities. MonsoonMap is an independent community documentation tool, not an emergency hotline or municipal ticket tracker.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#ded8cb] flex flex-col sm:flex-row items-center justify-between text-xs text-[#73827a] gap-4">
          <p>© 2026 MonsoonMap. Open-Source Civic Tech under MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Powered by local open-weight vision AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
