import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  EyeOff,
  UserX,
  Trash2,
  HardHat,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#55635b] hover:text-[#191f1b] mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5ede7] text-[#1c3b2c] text-xs font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4f7358]" />
          <span>Civic Trust & Field Safety</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#14281e]">
          Privacy Policy & Outdoor Field Safety
        </h1>
        <p className="text-sm sm:text-base text-[#55635b] mt-2 leading-relaxed">
          MonsoonMap is built on two non-negotiable principles: your personal privacy must be
          ironclad, and your physical safety while observing outdoors must always take precedence.
        </p>
      </div>

      {/* PART 1: FIELD SAFETY RULES */}
      <section className="bg-[#faefee] p-6 sm:p-8 rounded-3xl border border-[#e8b8b3] space-y-4">
        <div className="flex items-center gap-2.5 text-[#b34033]">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold">
            Outdoor Field Safety Guide
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#6b2019] leading-relaxed">
          Observing your neighborhood after heavy rainfall carries genuine physical hazards. Please
          review these mandatory safety rules before starting any field walk:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white/80 p-4 rounded-xl border border-[#e8b8b3]">
            <h4 className="text-xs font-bold text-[#14281e] flex items-center gap-2">
              <span className="text-base">🚫</span> Never Wade Into Floodwater
            </h4>
            <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
              Standing water conceals open manholes, missing drain grates, and submerged debris.
              Even 6 inches of moving water can knock an adult down. Always observe from dry ground.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-[#e8b8b3]">
            <h4 className="text-xs font-bold text-[#14281e] flex items-center gap-2">
              <span className="text-base">⚡</span> Beware of Fallen Utilities
            </h4>
            <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
              Stay at least 10 meters away from sagging or downed power lines, submerged electrical
              junction boxes, or streetlights with exposed wiring.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-[#e8b8b3]">
            <h4 className="text-xs font-bold text-[#14281e] flex items-center gap-2">
              <span className="text-base">🚗</span> Do Not Step Into Vehicular Flow
            </h4>
            <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
              When documenting puddles that obstruct sidewalks, do not step into active roadway
              lanes to take a picture. Stand on the sidewalk curb or across the street.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-[#e8b8b3]">
            <h4 className="text-xs font-bold text-[#14281e] flex items-center gap-2">
              <span className="text-base">🏡</span> Never Trespass on Private Property
            </h4>
            <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
              Only document conditions in public right-of-ways, municipal roads, sidewalks, and
              public parks. Respect property boundaries at all times.
            </p>
          </div>
        </div>
      </section>

      {/* PART 2: PRIVACY & DATA ETHICS */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14281e]">
          Our Privacy & Non-Surveillance Commitments
        </h2>

        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-[#ded8cb] flex items-start gap-3.5">
            <Lock className="w-5 h-5 text-[#4f7358] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#14281e]">Private By Default</h3>
              <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
                Your observations are stored locally in your browser and on your own application
                database instance. Nothing is broadcast publicly without your deliberate export
                action.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#ded8cb] flex items-start gap-3.5">
            <UserX className="w-5 h-5 text-[#2c6e8a] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#14281e]">No Facial Recognition or Vehicle Tracking</h3>
              <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
                MonsoonMap strictly analyzes public infrastructure—grates, pavement surfaces, and
                standing water. We do not extract facial biometrics, license plate numbers, or
                private personal details from photographs.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#ded8cb] flex items-start gap-3.5">
            <EyeOff className="w-5 h-5 text-[#c97a1e] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#14281e]">Optional, Approximate Geolocation</h3>
              <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
                GPS coordinates are 100% optional and permission-based. If you prefer not to share
                exact latitude/longitude, you can describe the general neighborhood cross-streets
                without activating your device GPS.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#ded8cb] flex items-start gap-3.5">
            <Trash2 className="w-5 h-5 text-[#b34033] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#14281e]">Complete Deletion Control</h3>
              <p className="text-xs text-[#55635b] mt-1 leading-relaxed">
                You can delete any observation record at any time with a single click. When deleted,
                the record and its associated image data are permanently removed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PART 3: CIVIC NOTICE */}
      <section className="bg-[#f6f3ed] p-6 rounded-2xl border border-[#e3ddd1] text-xs text-[#55635b] space-y-2">
        <h4 className="font-bold text-[#14281e] uppercase tracking-wider font-mono">
          Civic Legal Notice
        </h4>
        <p className="leading-relaxed">
          MonsoonMap is an open-source civic documentation software intended to empower residents,
          neighborhood associations, and civic volunteer groups. MonsoonMap does not represent any
          municipal corporation or government body. Reports generated through this application
          constitute community field documentation and do not replace official emergency dispatch
          services.
        </p>
      </section>
    </div>
  );
}
