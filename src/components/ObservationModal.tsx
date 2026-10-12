'use client';

import React, { useState } from 'react';
import {
  Observation,
  IssueCategory,
  CATEGORIES,
  AiAnalysisResult,
  SeverityLevel,
} from '@/lib/types';
import { compressImage } from '@/lib/client-utils';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  FileText,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface ObservationModalProps {
  walkId?: string | null;
  initialCategory?: IssueCategory;
  onClose: () => void;
  onSave: (obs: Observation) => void;
}

export default function ObservationModal({
  walkId = null,
  initialCategory = 'waterlogging',
  onClose,
  onSave,
}: ObservationModalProps) {
  // Step 1: Capture & Field Note; Step 2: Review AI Structuring & Approve
  const [step, setStep] = useState<'capture' | 'review'>('capture');

  // Input states
  const [category, setCategory] = useState<IssueCategory>(initialCategory);
  const [userNote, setUserNote] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Review & Correction states (Step 2)
  const [reviewedDescription, setReviewedDescription] = useState('');
  const [reviewedCategory, setReviewedCategory] = useState<IssueCategory>(category);
  const [reviewedSeverity, setReviewedSeverity] = useState<SeverityLevel>('medium');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Handle Photo selection & compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 1200, 0.8);
      setImagePreview(compressedDataUrl);
    } catch (err: any) {
      alert('Could not process photo: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle Geolocation capture
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        if (!locationName) {
          setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not acquire GPS: ' + err.message + '. You may enter the cross-street manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Run AI analysis
  const handleRunAnalysis = async () => {
    if (!userNote.trim() && !imagePreview) {
      alert('Please provide either a field note or a photo before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze-observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userNote: userNote.trim(),
          categoryHint: category,
          imageBase64: imagePreview,
          locationHint: locationName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze observation');
      }

      const analysis: AiAnalysisResult = data.analysis;
      setAiAnalysis(analysis);
      setReviewedCategory(analysis.suggestedCategory || category);
      setReviewedSeverity(analysis.severityLevel || 'medium');
      setReviewedDescription(analysis.evidenceSummary || userNote);
      setStep('review');
    } catch (err: any) {
      setAnalysisError(err.message || 'Analysis endpoint error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save reviewed observation
  const handleFinalSave = async () => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const id = `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newObservation: Observation = {
      id,
      walkId,
      category: reviewedCategory,
      title: `${CATEGORIES[reviewedCategory]?.label || 'Observed Condition'}`,
      userNote: userNote.trim(),
      description: reviewedDescription.trim() || userNote.trim(),
      imageUrl: imagePreview,
      hasPhoto: Boolean(imagePreview),
      location: {
        latitude,
        longitude,
        addressOrLandmark: locationName.trim() || null,
        accuracyMeters: accuracy,
        isApproximate: !latitude,
      },
      timestamp: now,
      aiAnalysis,
      userReview: {
        status: 'verified',
        reviewedAt: now,
        userCorrectionsMade: reviewedCategory !== category || Boolean(correctionNotes),
        correctionNotes: correctionNotes.trim() || null,
      },
      isSampleExample: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObservation),
      });

      if (!res.ok) {
        throw new Error('Failed to persist observation on server');
      }

      const data = await res.json();
      onSave(data.observation || newObservation);
      onClose();
    } catch (err: any) {
      alert('Could not save observation: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#fbf9f6] rounded-2xl border border-[#ded8cb] shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3ddd1] bg-[#f6f3ed]">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14281e]">
              {step === 'capture' ? 'Log Field Observation' : 'Review & Verify Evidence'}
            </h3>
            <p className="text-xs text-[#55635b]">
              {step === 'capture'
                ? 'Capture what you see outdoors. Put your phone away after recording.'
                : 'Review open-weight AI analysis. Correct any inaccuracies.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73827a] hover:bg-[#ded8cb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CAPTURE FORM */}
        {step === 'capture' && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Safety reminder */}
            <div className="flex items-start gap-2.5 bg-[#eaf3f7] border border-[#bed8e6] p-3 rounded-xl text-xs text-[#1b4d63]">
              <ShieldCheck className="w-4 h-4 text-[#2c6e8a] shrink-0 mt-0.5" />
              <span>
                <strong>Safety First:</strong> Observe from sidewalk or dry curb. Never step into
                active traffic, touch exposed wiring, or wade into deep water.
              </span>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1.5">
                Observed Issue Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                      category === cat.id
                        ? 'border-[#1c3b2c] bg-[#e5ede7] text-[#14281e] shadow-xs'
                        : 'border-[#ded8cb] bg-[#fbf9f6] text-[#55635b] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Note Textarea */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1.5">
                Walker Field Note
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={3}
                placeholder="E.g., Puddle covers entire corner ramp; pedestrians forced into vehicular road traffic..."
                className="w-full text-sm p-3 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c] text-[#191f1b] placeholder-[#9aa8a1]"
              />
            </div>

            {/* Photo Capture & Upload */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1.5">
                Field Photograph (Optional but Recommended)
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#ded8cb] bg-black/5">
                  <img
                    src={imagePreview}
                    alt="Observation preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#ded8cb] hover:border-[#1c3b2c] bg-white cursor-pointer transition-colors text-center group">
                    <Camera className="w-5 h-5 text-[#4f7358] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-medium text-[#14281e]">Take Photo</span>
                    <span className="text-[10px] text-[#73827a]">Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#ded8cb] hover:border-[#1c3b2c] bg-white cursor-pointer transition-colors text-center group">
                    <Upload className="w-5 h-5 text-[#2c6e8a] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-medium text-[#14281e]">Upload Image</span>
                    <span className="text-[10px] text-[#73827a]">Gallery / File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {isCompressing && (
                <div className="flex items-center gap-1.5 text-xs text-[#55635b] mt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1c3b2c]" />
                  <span>Optimizing photo size on-device...</span>
                </div>
              )}
            </div>

            {/* Location: GPS or Landmark */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold">
                  Location (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleCaptureLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 text-xs text-[#2c6e8a] hover:text-[#1b4d63] font-medium"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Locating...' : 'Get GPS Coordinates'}</span>
                </button>
              </div>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="E.g., 4th Ave & Elm St, or outside Library Gate"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c] text-[#191f1b]"
              />
              {latitude && longitude && (
                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-[#4f7358]">
                  <span>Coords: {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
                  {accuracy && <span>(±{Math.round(accuracy)}m)</span>}
                </div>
              )}
            </div>

            {analysisError && (
              <div className="p-3 rounded-xl bg-[#faefee] border border-[#e8b8b3] text-xs text-[#b34033] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e3ddd1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#55635b] hover:bg-[#f6f3ed]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAnalyzing || isCompressing}
                onClick={handleRunAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#1c3b2c] hover:bg-[#254d39] text-white shadow-sm disabled:opacity-50 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Structuring Evidence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#93b59b]" />
                    <span>Analyze with Open-Source AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: HUMAN REVIEW & VERIFICATION */}
        {step === 'review' && aiAnalysis && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* AI Provenance Notice */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                aiAnalysis.isDemoFallback
                  ? 'bg-[#fef7ea] border-[#f5d49c] text-[#78460e]'
                  : 'bg-[#eaf3f7] border-[#bed8e6] text-[#1b4d63]'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#c97a1e]" />
              <div>
                <div className="font-semibold">
                  {aiAnalysis.isDemoFallback ? 'Demo Fallback Analysis' : 'Local Gemma 3 Model Analysis'}
                </div>
                <div className="text-[11px] mt-0.5">
                  Model: <span className="font-mono">{aiAnalysis.openSourceModelUsed}</span>
                  {aiAnalysis.isDemoFallback &&
                    ' (Local Ollama offline; deterministic grounded heuristics applied)'}
                </div>
              </div>
            </div>

            {/* Editable Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1">
                Factual Evidence Summary (Citizen Reviewable)
              </label>
              <textarea
                value={reviewedDescription}
                onChange={(e) => setReviewedDescription(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c] text-[#191f1b]"
              />
            </div>

            {/* Category & Severity overrides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1">
                  Confirmed Category
                </label>
                <select
                  value={reviewedCategory}
                  onChange={(e) => setReviewedCategory(e.target.value as IssueCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
                >
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1">
                  Assessed Severity
                </label>
                <select
                  value={reviewedSeverity}
                  onChange={(e) => setReviewedSeverity(e.target.value as SeverityLevel)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
                >
                  <option value="low">Low (Passable with minor adjustment)</option>
                  <option value="medium">Medium (Significant pedestrian impediment)</option>
                  <option value="high">High (Severe hazard / pedestrian forced onto road)</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            {/* Observable Severity Indicators generated by AI */}
            {aiAnalysis.observableSeverityIndicators?.length > 0 && (
              <div className="p-3 rounded-xl bg-[#f6f3ed] border border-[#e3ddd1]">
                <div className="text-xs font-semibold text-[#14281e] mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4f7358]" />
                  <span>Observable Physical Indicators</span>
                </div>
                <ul className="text-xs text-[#55635b] space-y-1 list-disc list-inside">
                  {aiAnalysis.observableSeverityIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions for Human Verifier */}
            {aiAnalysis.questionsForHumanVerifier?.length > 0 && (
              <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#ded8cb]">
                <div className="text-xs font-semibold text-[#14281e] mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2c6e8a]" />
                  <span>Human Verification Prompts</span>
                </div>
                <ul className="text-xs text-[#55635b] space-y-1 list-disc list-inside">
                  {aiAnalysis.questionsForHumanVerifier.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optional Correction Notes */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#14281e] font-semibold mb-1">
                Walker Verification Notes (Optional)
              </label>
              <input
                type="text"
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="E.g., Confirmed with neighbor; water has remained since yesterday's rain"
                className="w-full text-xs p-2.5 rounded-xl border border-[#ded8cb] bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3b2c]"
              />
            </div>

            {/* Review Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-[#e3ddd1]">
              <button
                type="button"
                onClick={() => setStep('capture')}
                className="text-xs text-[#55635b] hover:text-[#191f1b] underline"
              >
                Back to Edit
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#55635b] hover:bg-[#f6f3ed]"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleFinalSave}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#1c3b2c] hover:bg-[#254d39] text-white shadow-sm transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#93b59b]" />
                      <span>Approve & Save Evidence</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
