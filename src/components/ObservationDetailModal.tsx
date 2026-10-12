'use client';

import React, { useState } from 'react';
import { Observation, CATEGORIES } from '@/lib/types';
import {
  formatFriendlyDate,
  generateMarkdownReport,
  calculateDistanceMeters,
} from '@/lib/client-utils';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Printer,
  Copy,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface ObservationDetailModalProps {
  observation: Observation;
  allObservations: Observation[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ObservationDetailModal({
  observation,
  allObservations,
  onClose,
  onDelete,
}: ObservationDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const catMeta = CATEGORIES[observation.category] || CATEGORIES.other;

  // Find nearby observations (< 150m)
  const nearbyObservations = allObservations.filter((other) => {
    if (other.id === observation.id) return false;
    if (
      !observation.location.latitude ||
      !observation.location.longitude ||
      !other.location.latitude ||
      !other.location.longitude
    )
      return false;

    const dist = calculateDistanceMeters(
      observation.location.latitude,
      observation.location.longitude,
      other.location.latitude,
      other.location.longitude
    );
    return dist <= 150;
  });

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport(observation);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fbf9f6] rounded-2xl border border-[#ded8cb] shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3ddd1] bg-[#f6f3ed] no-print">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: catMeta.color }}
            />
            <div>
              <span className="font-mono text-xs text-[#73827a] uppercase tracking-wider">
                Observation Record
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14281e]">
                {observation.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73827a] hover:bg-[#ded8cb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ded8cb]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-md font-medium border"
                style={{
                  backgroundColor: catMeta.bgLight,
                  color: catMeta.textDark,
                  borderColor: catMeta.borderLight,
                }}
              >
                {catMeta.label}
              </span>

              {observation.aiAnalysis && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-mono border ${
                    observation.aiAnalysis.severityLevel === 'high'
                      ? 'bg-[#faefee] text-[#b34033] border-[#e8b8b3]'
                      : observation.aiAnalysis.severityLevel === 'medium'
                      ? 'bg-[#fef7ea] text-[#c97a1e] border-[#f5d49c]'
                      : 'bg-[#eef5f0] text-[#4f7358] border-[#c2dec9]'
                  }`}
                >
                  Severity: {observation.aiAnalysis.severityLevel.toUpperCase()}
                </span>
              )}

              <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[#e5ede7] text-[#1c3b2c] border border-[#c2dec9]">
                Verified by Walker
              </span>

              {observation.isSampleExample && (
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-amber-100 text-amber-800 border border-amber-300">
                  Demo Sample Record
                </span>
              )}
            </div>

            <span className="font-mono text-xs text-[#73827a]">
              ID: {observation.id}
            </span>
          </div>

          {/* Photo if available */}
          {observation.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[#ded8cb] bg-black/5 max-h-72 flex items-center justify-center">
              <img
                src={observation.imageUrl}
                alt={observation.title}
                className="max-h-72 w-full object-contain"
              />
            </div>
          )}

          {/* Factual Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1">
              Field Evidence Summary
            </h4>
            <p className="text-sm text-[#191f1b] leading-relaxed bg-[#ffffff] p-3.5 rounded-xl border border-[#ded8cb]">
              {observation.description}
            </p>
          </div>

          {/* User Note */}
          {observation.userNote && observation.userNote !== observation.description && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#55635b] font-medium mb-1">
                Original Walker Field Note
              </h4>
              <p className="text-xs text-[#55635b] italic bg-[#f6f3ed] p-3 rounded-xl border border-[#e3ddd1]">
                "{observation.userNote}"
              </p>
            </div>
          )}

          {/* Location & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f6f3ed] border border-[#ded8cb] text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#2c6e8a] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#14281e]">Location Context:</span>
                <p className="text-[#55635b]">
                  {observation.location.addressOrLandmark || 'Neighborhood walking corridor'}
                </p>
                {observation.location.latitude && observation.location.longitude && (
                  <p className="font-mono text-[11px] text-[#73827a] mt-0.5">
                    {observation.location.latitude.toFixed(5)},{' '}
                    {observation.location.longitude.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#4f7358] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#14281e]">Timestamp:</span>
                <p className="text-[#55635b]">{formatFriendlyDate(observation.timestamp)}</p>
              </div>
            </div>
          </div>

          {/* Nearby Proximity Alert if duplicate / cluster exists */}
          {nearbyObservations.length > 0 && (
            <div className="p-3 rounded-xl bg-[#fef7ea] border border-[#f5d49c] text-xs text-[#78460e] flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-[#c97a1e] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Cluster Note:</span>{' '}
                {nearbyObservations.length} other observation(s) recorded within 150 meters of
                this location. Persistent infrastructure hotspot detected.
              </div>
            </div>
          )}

          {/* Open-Source AI Structured Breakdown */}
          {observation.aiAnalysis && (
            <div className="p-4 rounded-xl bg-[#fbf9f6] border border-[#ded8cb] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14281e]">
                  <Sparkles className="w-4 h-4 text-[#c97a1e]" />
                  <span>Open-Weight AI Physical Structuring</span>
                </div>
                <span className="text-[10px] font-mono text-[#73827a]">
                  {observation.aiAnalysis.openSourceModelUsed}
                </span>
              </div>

              {observation.aiAnalysis.observableSeverityIndicators?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-[#55635b]">
                    Observable Severity Factors:
                  </span>
                  <ul className="text-xs text-[#39443e] list-disc list-inside mt-0.5 space-y-0.5">
                    {observation.aiAnalysis.observableSeverityIndicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {observation.aiAnalysis.suggestedFollowups?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-[#55635b]">
                    Suggested Follow-up Observations:
                  </span>
                  <ul className="text-xs text-[#39443e] list-disc list-inside mt-0.5 space-y-0.5">
                    {observation.aiAnalysis.suggestedFollowups.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Civic Notice */}
          <p className="text-[11px] text-[#73827a] border-t border-[#ded8cb] pt-3 italic">
            Notice: This record was compiled by a neighborhood walker using MonsoonMap. It documents
            verifiable physical conditions to support local community action and municipal reporting.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#e3ddd1] bg-[#f6f3ed] no-print">
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#b34033] hover:text-[#90291f] font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#b34033] font-medium">Delete this record?</span>
                <button
                  type="button"
                  onClick={() => onDelete(observation.id)}
                  className="px-2 py-1 bg-[#b34033] text-white rounded text-xs font-medium"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 bg-[#ded8cb] text-[#55635b] rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#ffffff] hover:bg-[#fbf9f6] text-[#14281e] border border-[#ded8cb] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4f7358]" /> : <Copy className="w-3.5 h-3.5 text-[#55635b]" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Report'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1c3b2c] hover:bg-[#254d39] text-white shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#93b59b]" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
