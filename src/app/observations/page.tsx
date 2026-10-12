'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Observation, IssueCategory, CATEGORIES, SeverityLevel } from '@/lib/types';
import { formatFriendlyDate } from '@/lib/client-utils';
import ObservationModal from '@/components/ObservationModal';
import ObservationDetailModal from '@/components/ObservationDetailModal';
import {
  MapPin,
  List,
  Filter,
  Plus,
  Search,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';

// Dynamically import Leaflet Map (SSR: false)
const ObservationsMap = dynamic(() => import('@/components/ObservationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] sm:h-[500px] rounded-xl border border-[#e3ddd1] bg-[#f6f3ed] flex flex-col items-center justify-center text-xs text-[#73827a]">
      <div className="w-6 h-6 border-2 border-[#1c3b2c] border-t-transparent rounded-full animate-spin mb-2" />
      <span>Loading OpenStreetMap tiles...</span>
    </div>
  ),
});

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSamples, setShowSamples] = useState(true); // Toggle demo examples

  // Active modals
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Fetch observations
  const fetchObservations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/observations?includeSamples=${showSamples}`);
      if (!res.ok) throw new Error('Failed to load observations');
      const data = await res.json();
      setObservations(data.observations || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching observations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [showSamples]);

  // Handle observation delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/observations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setObservations((prev) => prev.filter((o) => o.id !== id));
      setSelectedObservation(null);
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  // Filtered observations
  const filteredObservations = observations.filter((obs) => {
    if (categoryFilter !== 'all' && obs.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = obs.title.toLowerCase().includes(q);
      const matchDesc = obs.description.toLowerCase().includes(q);
      const matchNote = obs.userNote.toLowerCase().includes(q);
      const matchLoc = (obs.location.addressOrLandmark || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNote && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf3f7] text-[#1b4d63] text-xs font-mono mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#2c6e8a]" />
            <span>Civic Evidence Map & Timeline</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14281e]">
            Field Observations
          </h1>
          <p className="text-xs sm:text-sm text-[#55635b] mt-1">
            Explore verified neighborhood reports, track recurring choke points, and generate
            shareable evidence.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3b2c] hover:bg-[#254d39] text-[#fbf9f6] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-[#93b59b]" />
          <span>Log New Observation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ded8cb] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#73827a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by street, keywords, or issue..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-[#ded8cb] bg-[#fbf9f6] focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#ded8cb] bg-[#fbf9f6] text-[#14281e] focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
          >
            <option value="all">All Issue Categories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Toggle sample records */}
          <label className="flex items-center gap-2 text-xs text-[#55635b] cursor-pointer shrink-0 select-none px-2 py-1.5 rounded-xl border border-[#ded8cb] bg-[#fbf9f6]">
            <input
              type="checkbox"
              checked={showSamples}
              onChange={(e) => setShowSamples(e.target.checked)}
              className="rounded text-[#1c3b2c] focus:ring-[#1c3b2c]"
            />
            <span>Include Demo Examples</span>
          </label>
        </div>
      </div>

      {/* MAP & LIST SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map (or toggle) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold">
              Interactive Map ({filteredObservations.filter((o) => o.location.latitude).length} Geo-tagged)
            </span>
          </div>

          <ObservationsMap
            observations={filteredObservations}
            selectedId={selectedObservation?.id || null}
            onSelectObservation={(obs) => setSelectedObservation(obs)}
          />
        </div>

        {/* Right Column: Synchronized Timeline & Card List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold">
              Observation Timeline ({filteredObservations.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#ded8cb] text-xs text-[#73827a]">
              Loading saved observations...
            </div>
          ) : filteredObservations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#ded8cb] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#f6f3ed] flex items-center justify-center mx-auto text-[#73827a]">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#14281e]">
                No observations match your filter
              </h4>
              <p className="text-xs text-[#55635b] max-w-xs mx-auto">
                No observations found. Step outdoors on a walk to log your first neighborhood report!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c3b2c] text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Observation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredObservations.map((obs) => {
                const cat = CATEGORIES[obs.category] || CATEGORIES.other;
                const isSelected = selectedObservation?.id === obs.id;

                return (
                  <div
                    key={obs.id}
                    onClick={() => setSelectedObservation(obs)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1c3b2c] bg-[#e5ede7] shadow-sm'
                        : 'border-[#ded8cb] bg-white hover:bg-[#fbf9f6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: cat.bgLight,
                            color: cat.textDark,
                            borderColor: cat.borderLight,
                          }}
                        >
                          {cat.shortLabel}
                        </span>
                        {obs.isSampleExample && (
                          <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Demo
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#73827a]">
                        {formatFriendlyDate(obs.timestamp)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#14281e] mt-2 line-clamp-1">
                      {obs.title}
                    </h4>

                    <p className="text-xs text-[#55635b] mt-1 line-clamp-2 leading-relaxed">
                      {obs.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#f0ebe0] flex items-center justify-between text-[11px] text-[#73827a]">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-[#2c6e8a] shrink-0" />
                        <span className="truncate">
                          {obs.location.addressOrLandmark || 'Corridor observation'}
                        </span>
                      </span>
                      <span className="font-mono text-[#1c3b2c] font-medium flex items-center gap-0.5">
                        Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedObservation && (
        <ObservationDetailModal
          observation={selectedObservation}
          allObservations={observations}
          onClose={() => setSelectedObservation(null)}
          onDelete={handleDelete}
        />
      )}

      {/* CREATE OBSERVATION MODAL */}
      {showCreateModal && (
        <ObservationModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newObs) => {
            setObservations((prev) => [newObs, ...prev]);
            setSelectedObservation(newObs);
          }}
        />
      )}
    </div>
  );
}
