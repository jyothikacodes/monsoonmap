import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Footprints,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Camera,
  FileCheck,
  Droplets,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Subtle civic badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e5ede7] border border-[#c2dec9] text-[#1c3b2c] text-xs font-mono mb-6">
          <Footprints className="w-3.5 h-3.5 text-[#4f7358]" />
          <span>Hacktoberfest x DEV Week 1 • “Touch Grass” Challenge</span>
        </div>

        {/* Distinctive editorial heading */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#14281e] max-w-4xl mx-auto leading-[1.08]">
          Walk your streets. <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#2c6e8a]">Expose the problems.</span> <br />
          Make the evidence count.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#55635b] max-w-2xl mx-auto leading-relaxed font-sans">
          Ordinary neighborhood walks reveal critical environmental issues—blocked storm drains,
          submerged curb ramps, and broken footpaths after rainfall. MonsoonMap uses open-weight
          vision AI to turn what you discover outdoors into structured, human-verified civic evidence.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/walk"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1c3b2c] hover:bg-[#254d39] text-[#fbf9f6] text-base font-medium shadow-md transition-all group"
          >
            <Footprints className="w-5 h-5 text-[#93b59b] group-hover:scale-110 transition-transform" />
            <span>Start a Field Walk</span>
            <ArrowRight className="w-4 h-4 text-[#93b59b]" />
          </Link>

          <Link
            href="/observations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f6f3ed] text-[#14281e] border border-[#ded8cb] text-base font-medium shadow-xs transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#2c6e8a]" />
            <span>Explore Observations & Map</span>
          </Link>
        </div>

        {/* Philosophy notice: put phone in pocket */}
        <div className="mt-6 text-xs text-[#73827a] flex items-center justify-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#4f7358]" />
          <span>Designed for pocket carry. Put your phone away while walking outdoors.</span>
        </div>
      </section>

      {/* CORE PRODUCT LOOP (THE 4 STEPS) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#4f7358] font-semibold">
            The Observation Workflow
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#14281e] mt-1">
            From sidewalk puddle to verified evidence
          </h2>
          <p className="text-sm text-[#55635b] max-w-xl mx-auto mt-2">
            No endless screen-scrolling or gamified badges. Just clear, disciplined observation that
            respects your time outdoors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#ded8cb] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#e5ede7] flex items-center justify-center text-[#1c3b2c] mb-4 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14281e]">Take an Outdoor Walk</h3>
              <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
                Choose a 10, 20, or 30-minute route. Focus on rainfall waterlogging, drainage grates,
                or footpath safety. Put your phone in your pocket.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0ebe0] text-[11px] font-mono text-[#4f7358]">
              Target: 20m rain survey
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#ded8cb] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#eaf3f7] flex items-center justify-center text-[#2c6e8a] mb-4 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14281e]">Capture Visible Condition</h3>
              <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
                When you spot an obstacle—like standing water blocking a ramp—snap a quick photo and
                jot a 1-sentence note from a safe vantage point.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0ebe0] text-[11px] font-mono text-[#2c6e8a]">
              Photo + Field note
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#ded8cb] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#fef7ea] flex items-center justify-center text-[#c97a1e] mb-4 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14281e]">Open-Weight AI Analysis</h3>
              <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
                A local vision-capable Gemma model extracts observable physical factors, isolates
                facts from assumptions, and suggests follow-up checks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0ebe0] text-[11px] font-mono text-[#c97a1e]">
              Gemma 3 Vision
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#ded8cb] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#e5ede7] flex items-center justify-center text-[#1c3b2c] mb-4 font-mono font-bold text-sm">
                04
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14281e]">Human Review & Report</h3>
              <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
                You review the findings, adjust any classifications, and approve the report. Export
                clean PDF evidence for civic assemblies or community boards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0ebe0] text-[11px] font-mono text-[#1c3b2c]">
              Verified civic record
            </div>
          </div>
        </div>
      </section>

      {/* MAP & EVIDENCE PREVIEW BANNER */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-[#f6f3ed] rounded-3xl border border-[#e3ddd1] p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#2c6e8a] font-semibold">
                OpenStreetMap Integration
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14281e] mt-1">
                Visualizing recurring neighborhood choke points
              </h3>
              <p className="text-xs sm:text-sm text-[#55635b] mt-3 leading-relaxed">
                See where waterlogging recurs, which intersections have blocked drains, and where
                damaged pavers pose wet-weather slip risks. Filter by category, inspect photo
                evidence, and track neighborhood conditions over time.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/observations"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3b2c] hover:bg-[#254d39] text-[#fbf9f6] text-xs sm:text-sm font-medium transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4 text-[#93b59b]" />
                  <span>View Live Map & Timeline</span>
                </Link>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#ded8cb] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#f0ebe0] pb-2">
                <span className="text-xs font-mono font-semibold text-[#14281e]">
                  Active Field Indicators
                </span>
                <span className="text-[10px] font-mono text-[#4f7358] bg-[#eef5f0] px-2 py-0.5 rounded">
                  Live DB Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#f0ebe0]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2c6e8a]" />
                    <span className="text-[#191f1b]">Waterlogging & Standing Water</span>
                  </span>
                  <span className="font-mono text-[#73827a]">High Priority</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#f0ebe0]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c97a1e]" />
                    <span className="text-[#191f1b]">Blocked & Choked Drainage</span>
                  </span>
                  <span className="font-mono text-[#73827a]">Inlet Obstruction</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#f0ebe0]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4f7358]" />
                    <span className="text-[#191f1b]">Damaged Footpath Pavements</span>
                  </span>
                  <span className="font-mono text-[#73827a]">Trip Hazard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY OPEN-WEIGHT AI MATTERS */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#ded8cb]">
            <Sparkles className="w-6 h-6 text-[#2c6e8a] mb-3" />
            <h4 className="font-serif text-lg font-bold text-[#14281e]">Gemma 3 Open Weights</h4>
            <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
              We connect directly to open-weight vision models (such as Gemma 3) running on your own
              machine via Ollama. No proprietary closed APIs; zero recurring vendor lock-in.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ded8cb]">
            <ShieldCheck className="w-6 h-6 text-[#4f7358] mb-3" />
            <h4 className="font-serif text-lg font-bold text-[#14281e]">Zero Cloud Surveillance</h4>
            <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
              Photos of your neighborhood and daily walking paths stay in your browser and local
              persistence. We never upload your images to third-party commercial clouds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ded8cb]">
            <CheckCircle2 className="w-6 h-6 text-[#1c3b2c] mb-3" />
            <h4 className="font-serif text-lg font-bold text-[#14281e]">Disciplined Evidence</h4>
            <p className="text-xs text-[#55635b] mt-2 leading-relaxed">
              The AI strictly distinguishes visible physical facts from assumptions. You retain 100%
              human editorial authority over every final report.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto text-center pt-8">
        <div className="bg-[#1c3b2c] text-[#fbf9f6] p-8 sm:p-12 rounded-3xl shadow-lg">
          <h3 className="font-serif text-2xl sm:text-4xl font-bold">
            Ready to step outside and observe?
          </h3>
          <p className="text-xs sm:text-sm text-[#93b59b] max-w-lg mx-auto mt-3">
            Grab an umbrella, put your phone in your pocket, and walk your neighborhood block for 15
            minutes. Notice what the rain reveals.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/walk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fbf9f6] hover:bg-[#ffffff] text-[#14281e] text-sm font-semibold transition-colors shadow-sm"
            >
              <Footprints className="w-4 h-4 text-[#1c3b2c]" />
              <span>Begin Observation Walk</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
