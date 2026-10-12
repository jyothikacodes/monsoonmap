'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  WalkSession,
  WalkFocus,
  ChecklistItem,
  Observation,
  CATEGORIES,
} from '@/lib/types';
import { getDefaultChecklist } from '@/lib/client-utils';
import ObservationModal from '@/components/ObservationModal';
import {
  Footprints,
  Play,
  Square,
  Clock,
  Camera,
  CheckSquare,
  Square as UncheckedSquare,
  ShieldCheck,
  Smartphone,
  EyeOff,
  AlertCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const FOCUS_OPTIONS: Array<{ id: WalkFocus; label: string; desc: string; icon: string }> = [
  {
    id: 'rainfall_waterlogging',
    label: 'Rainfall & Waterlogging',
    desc: 'Standing puddles, submerged ramps, street ponding',
    icon: '💧',
  },
  {
    id: 'blocked_drainage',
    label: 'Drainage & Inlets',
    desc: 'Choked storm grates, silted gutters, missing covers',
    icon: '🚧',
  },
  {
    id: 'footpath_safety',
    label: 'Footpath & Pavement',
    desc: 'Dislodged pavers, slippery mud, potholes, trip hazards',
    icon: '⚠️',
  },
  {
    id: 'litter_waste',
    label: 'Litter & Runoff Waste',
    desc: 'Plastic build-up, uncollected garbage clogging runoff',
    icon: '🗑️',
  },
  {
    id: 'general',
    label: 'General Neighborhood Conditions',
    desc: 'Holistic pedestrian safety and drainage review',
    icon: '🧭',
  },
];

export default function WalkPage() {
  // Session setup state
  const [targetDuration, setTargetDuration] = useState<number>(20);
  const [selectedFocus, setSelectedFocus] = useState<WalkFocus>('rainfall_waterlogging');
  const [walkTitle, setWalkTitle] = useState('Neighborhood Rain Walk');

  // Active walk state
  const [activeSession, setActiveSession] = useState<WalkSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pocketMode, setPocketMode] = useState(false); // Dim screen for pocket carry

  // Captured observations during this walk
  const [walkObservations, setWalkObservations] = useState<Observation[]>([]);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Restore active session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('monsoonmap_active_walk');
    if (saved) {
      try {
        const parsed: WalkSession = JSON.parse(saved);
        if (parsed.status === 'active') {
          setActiveSession(parsed);
          const startMs = new Date(parsed.startedAt).getTime();
          const elapsed = Math.floor((Date.now() - startMs) / 1000);
          setElapsedSeconds(Math.max(0, elapsed));
        }
      } catch (e) {
        console.error('Failed to parse saved walk:', e);
      }
    }
  }, []);

  // Timer loop when walk is active
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    const timer = setInterval(() => {
      const startMs = new Date(activeSession.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Persist session updates
  const updateSessionState = (updated: WalkSession) => {
    setActiveSession(updated);
    localStorage.setItem('monsoonmap_active_walk', JSON.stringify(updated));
  };

  // Start Walk
  const handleStartWalk = () => {
    const newSession: WalkSession = {
      id: `walk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: walkTitle.trim() || 'Neighborhood Rain Walk',
      startedAt: new Date().toISOString(),
      endedAt: null,
      targetDurationMinutes: targetDuration,
      focus: selectedFocus,
      observationsCount: 0,
      checklist: getDefaultChecklist(selectedFocus),
      status: 'active',
      notes: '',
    };

    updateSessionState(newSession);
    setElapsedSeconds(0);
    setWalkObservations([]);
  };

  // Toggle checklist item
  const handleToggleChecklist = (itemId: string) => {
    if (!activeSession) return;
    const updatedChecklist = activeSession.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    updateSessionState({
      ...activeSession,
      checklist: updatedChecklist,
    });
  };

  // End Walk
  const handleEndWalk = async () => {
    if (!activeSession) return;

    const endedSession: WalkSession = {
      ...activeSession,
      endedAt: new Date().toISOString(),
      status: 'completed',
      observationsCount: walkObservations.length,
    };

    localStorage.removeItem('monsoonmap_active_walk');
    setActiveSession(null);

    // Save session to backend
    try {
      await fetch('/api/walks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endedSession),
      });
    } catch (e) {
      console.error('Failed to save walk session to server:', e);
    }

    setShowSummaryModal(true);
  };

  // Add observation saved from modal
  const handleObservationSaved = (obs: Observation) => {
    setWalkObservations((prev) => [obs, ...prev]);
    if (activeSession) {
      updateSessionState({
        ...activeSession,
        observationsCount: activeSession.observationsCount + 1,
      });
    }
  };

  // Format MM:SS
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = activeSession
    ? Math.min(100, Math.round((elapsedSeconds / (activeSession.targetDurationMinutes * 60)) * 100))
    : 0;

  // Pocket Mode Screen Dimmer
  if (pocketMode) {
    return (
      <div
        onClick={() => setPocketMode(false)}
        className="fixed inset-0 z-50 bg-[#0d1a13] text-[#93b59b] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
      >
        <Smartphone className="w-12 h-12 text-[#4f7358] mb-4 animate-pulse" />
        <h2 className="font-serif text-2xl font-bold text-[#fbf9f6]">Pocket Mode Active</h2>
        <p className="text-xs text-[#678f72] max-w-xs mt-2">
          Keep your phone in your pocket and observe your surroundings.
        </p>
        <div className="font-mono text-3xl font-bold text-[#fbf9f6] my-6">
          {formatTimer(elapsedSeconds)}
        </div>
        <p className="text-[11px] text-[#4f7358] uppercase tracking-wider font-mono">
          Tap anywhere to wake screen & log an observation
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. SETUP VIEW (WHEN NO WALK IS ACTIVE) */}
      {!activeSession && (
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5ede7] text-[#1c3b2c] text-xs font-mono mb-3">
              <Footprints className="w-3.5 h-3.5 text-[#4f7358]" />
              <span>Outdoor Observation Session</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14281e]">
              Start an Observation Walk
            </h1>
            <p className="text-sm text-[#55635b] mt-2">
              Select your focus and target duration. Once started, MonsoonMap keeps time in the
              background so you can keep your phone put away until you spot something actionable.
            </p>
          </div>

          {/* Walk Title */}
          <div className="bg-white p-5 rounded-2xl border border-[#ded8cb] shadow-xs">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1.5">
              Walk Title or Route
            </label>
            <input
              type="text"
              value={walkTitle}
              onChange={(e) => setWalkTitle(e.target.value)}
              placeholder="E.g., Morning Rain Survey - 5th Cross Road"
              className="w-full text-sm p-3 rounded-xl border border-[#ded8cb] bg-[#fbf9f6] focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
            />
          </div>

          {/* Target Duration Selection */}
          <div className="bg-white p-5 rounded-2xl border border-[#ded8cb] shadow-xs">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-3">
              Target Walk Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetDuration(mins)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    targetDuration === mins
                      ? 'border-[#1c3b2c] bg-[#e5ede7] text-[#14281e] shadow-xs'
                      : 'border-[#ded8cb] bg-[#fbf9f6] text-[#55635b] hover:bg-[#f6f3ed]'
                  }`}
                >
                  <div className="font-serif text-2xl font-bold">{mins}</div>
                  <div className="text-xs font-medium">Minutes</div>
                </button>
              ))}
            </div>
          </div>

          {/* Observation Focus */}
          <div className="bg-white p-5 rounded-2xl border border-[#ded8cb] shadow-xs">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-3">
              Observation Focus & Checklist
            </label>
            <div className="space-y-2.5">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFocus(opt.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    selectedFocus === opt.id
                      ? 'border-[#1c3b2c] bg-[#e5ede7] text-[#14281e] shadow-xs'
                      : 'border-[#ded8cb] bg-[#fbf9f6] text-[#55635b] hover:bg-[#f6f3ed]'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-[#73827a] mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <button
            type="button"
            onClick={handleStartWalk}
            className="w-full flex items-center justify-center gap-2.5 p-4 rounded-xl bg-[#1c3b2c] hover:bg-[#254d39] text-[#fbf9f6] text-base font-semibold shadow-md transition-all"
          >
            <Play className="w-5 h-5 fill-current text-[#93b59b]" />
            <span>Begin Outdoor Walk ({targetDuration} Min)</span>
          </button>
        </div>
      )}

      {/* 2. ACTIVE WALK VIEW */}
      {activeSession && (
        <div className="space-y-6">
          {/* Top Bar with Title & End Action */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ded8cb]">
            <div>
              <span className="text-[11px] font-mono text-[#4f7358] uppercase tracking-wider font-semibold">
                ● Live Outdoor Walk Active
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#14281e]">
                {activeSession.title}
              </h1>
            </div>
            <button
              onClick={handleEndWalk}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faefee] hover:bg-[#f5dbd8] text-[#b34033] border border-[#e8b8b3] text-xs font-semibold transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Finish Walk</span>
            </button>
          </div>

          {/* Timer & Pocket Mode Banner */}
          <div className="bg-[#1c3b2c] text-[#fbf9f6] p-6 rounded-3xl shadow-md text-center relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-widest text-[#93b59b] mb-1">
              Elapsed Time
            </div>
            <div className="font-mono text-5xl font-bold tracking-tight">
              {formatTimer(elapsedSeconds)}
            </div>

            {/* Target progress bar */}
            <div className="mt-4 max-w-xs mx-auto">
              <div className="flex justify-between text-[11px] font-mono text-[#93b59b] mb-1">
                <span>{progressPercent}% target</span>
                <span>{activeSession.targetDurationMinutes}m goal</span>
              </div>
              <div className="w-full bg-[#14281e] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#93b59b] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Pocket Mode button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setPocketMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#254d39] hover:bg-[#336149] text-xs font-medium text-[#fbf9f6] border border-[#4f7358] transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#93b59b]" />
                <span>Screen Off / Pocket Mode</span>
              </button>
            </div>
          </div>

          {/* Main Action: Log Observation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setShowCaptureModal(true)}
              className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#2c6e8a] hover:bg-[#1b4d63] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Log Observation Here</span>
            </button>

            <div className="bg-white p-3.5 rounded-2xl border border-[#ded8cb] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#73827a] uppercase">
                  Logged on Walk
                </span>
                <div className="font-serif text-xl font-bold text-[#14281e]">
                  {walkObservations.length} Observation{walkObservations.length === 1 ? '' : 's'}
                </div>
              </div>
              <span className="text-2xl">📸</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-[#ded8cb] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg font-bold text-[#14281e]">
                Field Observation Checklist
              </h3>
              <span className="text-xs font-mono text-[#73827a]">
                {activeSession.checklist.filter((i) => i.checked).length} of{' '}
                {activeSession.checklist.length} noted
              </span>
            </div>

            <div className="space-y-2">
              {activeSession.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-[#e5ede7] border-[#c2dec9] text-[#1c3b2c]'
                      : 'bg-[#fbf9f6] border-[#ded8cb] text-[#55635b] hover:bg-[#f6f3ed]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-[#1c3b2c]" />
                    ) : (
                      <UncheckedSquare className="w-4 h-4 text-[#9aa8a1]" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        item.checked ? 'line-through text-[#4f7358]' : 'text-[#191f1b]'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#73827a] mt-0.5">{item.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observations recorded during this walk */}
          {walkObservations.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#ded8cb] shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#14281e] mb-3">
                Observations Recorded in this Session
              </h3>
              <div className="space-y-2.5">
                {walkObservations.map((obs) => {
                  const cat = CATEGORIES[obs.category] || CATEGORIES.other;
                  return (
                    <div
                      key={obs.id}
                      className="p-3 rounded-xl border border-[#ded8cb] bg-[#fbf9f6] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <div className="text-xs font-bold text-[#14281e]">{obs.title}</div>
                          <div className="text-[11px] text-[#55635b] truncate max-w-xs">
                            {obs.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#73827a]">{obs.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. WALK SUMMARY MODAL */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fbf9f6] max-w-md w-full rounded-2xl border border-[#ded8cb] p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#e5ede7] text-[#1c3b2c] flex items-center justify-center mx-auto mb-3">
              <Footprints className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#14281e]">
              Field Walk Completed!
            </h3>
            <p className="text-xs text-[#55635b] mt-1.5">
              Thank you for taking time outdoors to observe your neighborhood conditions.
            </p>

            <div className="my-5 p-4 rounded-xl bg-white border border-[#ded8cb] grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#73827a]">Duration</span>
                <div className="font-serif text-xl font-bold text-[#14281e]">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#73827a]">
                  Observations
                </span>
                <div className="font-serif text-xl font-bold text-[#14281e]">
                  {walkObservations.length}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="/observations"
                className="w-full py-3 rounded-xl bg-[#1c3b2c] hover:bg-[#254d39] text-white text-xs font-semibold shadow-xs"
              >
                View Map & Export Evidence Reports
              </a>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-full py-2.5 rounded-xl text-xs text-[#55635b] hover:bg-[#f6f3ed]"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. OBSERVATION CAPTURE MODAL */}
      {showCaptureModal && (
        <ObservationModal
          walkId={activeSession?.id}
          initialCategory={
            selectedFocus === 'rainfall_waterlogging'
              ? 'waterlogging'
              : selectedFocus === 'blocked_drainage'
              ? 'blocked_drainage'
              : selectedFocus === 'footpath_safety'
              ? 'damaged_footpath'
              : selectedFocus === 'litter_waste'
              ? 'litter'
              : 'other'
          }
          onClose={() => setShowCaptureModal(false)}
          onSave={handleObservationSaved}
        />
      )}
    </div>
  );
}
