export type IssueCategory =
  | 'waterlogging'
  | 'blocked_drainage'
  | 'litter'
  | 'damaged_footpath'
  | 'unsafe_crossing'
  | 'other';

export interface CategoryMeta {
  id: IssueCategory;
  label: string;
  shortLabel: string;
  description: string;
  color: string; // Hex for map markers and UI accents
  bgLight: string;
  textDark: string;
  borderLight: string;
}

export const CATEGORIES: Record<IssueCategory, CategoryMeta> = {
  waterlogging: {
    id: 'waterlogging',
    label: 'Waterlogging & Standing Water',
    shortLabel: 'Waterlogged',
    description: 'Persistent puddles, submerged paths, or ponding impeding pedestrian flow',
    color: '#2c6e8a',
    bgLight: '#eaf3f7',
    textDark: '#1b4d63',
    borderLight: '#bed8e6',
  },
  blocked_drainage: {
    id: 'blocked_drainage',
    label: 'Blocked or Broken Drainage',
    shortLabel: 'Blocked Drain',
    description: 'Choked grating, silted storm drains, missing covers, or overflowing culverts',
    color: '#c97a1e',
    bgLight: '#fef7ea',
    textDark: '#78460e',
    borderLight: '#f5d49c',
  },
  litter: {
    id: 'litter',
    label: 'Accumulated Litter & Waste',
    shortLabel: 'Litter / Waste',
    description: 'Plastic accumulation, uncollected dump sites, or runoff trash obstructing walkways',
    color: '#7e57c2',
    bgLight: '#f4effc',
    textDark: '#4a287a',
    borderLight: '#d6c4f0',
  },
  damaged_footpath: {
    id: 'damaged_footpath',
    label: 'Damaged Footpath or Pavement',
    shortLabel: 'Broken Walkway',
    description: 'Cracked paving stones, potholes, uneven curbs, or muddy detours',
    color: '#4f7358',
    bgLight: '#eef5f0',
    textDark: '#26422d',
    borderLight: '#c2dec9',
  },
  unsafe_crossing: {
    id: 'unsafe_crossing',
    label: 'Unsafe Pedestrian Crossing',
    shortLabel: 'Unsafe Crossing',
    description: 'Flooded curb ramps, blocked zebra crossings, or dangerous crossing geometry',
    color: '#b34033',
    bgLight: '#faefee',
    textDark: '#6b2019',
    borderLight: '#e8b8b3',
  },
  other: {
    id: 'other',
    label: 'Other Neighborhood Condition',
    shortLabel: 'Other Issue',
    description: 'Fallen vegetation, street lighting gaps, or unclassified physical obstacles',
    color: '#55635b',
    bgLight: '#f0f3f1',
    textDark: '#2c3631',
    borderLight: '#ccd4ce',
  },
};

export type WalkFocus =
  | 'rainfall_waterlogging'
  | 'blocked_drainage'
  | 'litter_waste'
  | 'footpath_safety'
  | 'general';

export interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
}

export interface WalkSession {
  id: string;
  title: string;
  startedAt: string; // ISO string
  endedAt: string | null;
  targetDurationMinutes: number; // 10, 20, 30
  focus: WalkFocus;
  observationsCount: number;
  checklist: ChecklistItem[];
  status: 'active' | 'completed' | 'abandoned';
  notes: string;
}

export interface ObservationLocation {
  latitude: number | null;
  longitude: number | null;
  addressOrLandmark: string | null;
  accuracyMeters: number | null;
  isApproximate: boolean;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'unverified';

export interface AiAnalysisResult {
  suggestedCategory: IssueCategory;
  evidenceSummary: string;
  observableSeverityIndicators: string[];
  severityLevel: SeverityLevel;
  confidenceScore: number;
  confidenceRationale: string;
  suggestedFollowups: string[];
  questionsForHumanVerifier: string[];
  openSourceModelUsed: string;
  isDemoFallback: boolean;
  analyzedAt: string;
}

export interface UserReview {
  status: 'verified' | 'edited' | 'unverified';
  reviewedAt: string;
  userCorrectionsMade: boolean;
  correctionNotes: string | null;
}

export interface Observation {
  id: string; // e.g. MM-2026-9812
  walkId: string | null;
  category: IssueCategory;
  title: string;
  userNote: string;
  description: string; // Final user-approved description
  imageUrl: string | null;
  hasPhoto: boolean;
  location: ObservationLocation;
  timestamp: string; // ISO timestamp
  aiAnalysis: AiAnalysisResult | null;
  userReview: UserReview;
  isSampleExample: boolean; // Flag to separate sample demos from genuine observations
  createdAt: string;
  updatedAt: string;
}

export interface WalkStats {
  totalWalks: number;
  totalWalkMinutes: number;
  totalObservations: number;
  verifiedObservations: number;
  categoryCounts: Record<IssueCategory, number>;
}
