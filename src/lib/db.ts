import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Observation, WalkSession, IssueCategory } from './types';

let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'monsoonmap.db');
  dbInstance = new DatabaseSync(dbPath);

  // Initialize schema
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      walk_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      user_note TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      has_photo INTEGER NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      address_or_landmark TEXT,
      accuracy_meters REAL,
      is_approximate INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL,
      ai_analysis_json TEXT,
      user_review_json TEXT NOT NULL,
      is_sample_example INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS walk_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      target_duration_minutes INTEGER NOT NULL,
      focus TEXT NOT NULL,
      observations_count INTEGER NOT NULL DEFAULT 0,
      checklist_json TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT
    );
  `);

  // Ensure default reference examples exist if DB is fresh
  seedExamplesIfEmpty(dbInstance);

  return dbInstance;
}

function mapRowToObservation(row: any): Observation {
  return {
    id: row.id,
    walkId: row.walk_id || null,
    category: row.category as IssueCategory,
    title: row.title,
    userNote: row.user_note,
    description: row.description,
    imageUrl: row.image_url || null,
    hasPhoto: Boolean(row.has_photo),
    location: {
      latitude: row.latitude !== null ? Number(row.latitude) : null,
      longitude: row.longitude !== null ? Number(row.longitude) : null,
      addressOrLandmark: row.address_or_landmark || null,
      accuracyMeters: row.accuracy_meters !== null ? Number(row.accuracy_meters) : null,
      isApproximate: Boolean(row.is_approximate),
    },
    timestamp: row.timestamp,
    aiAnalysis: row.ai_analysis_json ? JSON.parse(row.ai_analysis_json) : null,
    userReview: JSON.parse(row.user_review_json),
    isSampleExample: Boolean(row.is_sample_example),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllObservations(includeSamples = true): Observation[] {
  const db = getDb();
  let query = 'SELECT * FROM observations';
  if (!includeSamples) {
    query += ' WHERE is_sample_example = 0';
  }
  query += ' ORDER BY timestamp DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all() as any[];
  return rows.map(mapRowToObservation);
}

export function getObservationById(id: string): Observation | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM observations WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;
  return mapRowToObservation(row);
}

export function saveObservation(obs: Observation): Observation {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO observations (
      id, walk_id, category, title, user_note, description,
      image_url, has_photo, latitude, longitude, address_or_landmark,
      accuracy_meters, is_approximate, timestamp, ai_analysis_json,
      user_review_json, is_sample_example, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      category = excluded.category,
      title = excluded.title,
      user_note = excluded.user_note,
      description = excluded.description,
      image_url = excluded.image_url,
      has_photo = excluded.has_photo,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      address_or_landmark = excluded.address_or_landmark,
      accuracy_meters = excluded.accuracy_meters,
      is_approximate = excluded.is_approximate,
      timestamp = excluded.timestamp,
      ai_analysis_json = excluded.ai_analysis_json,
      user_review_json = excluded.user_review_json,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    obs.id,
    obs.walkId,
    obs.category,
    obs.title,
    obs.userNote,
    obs.description,
    obs.imageUrl,
    obs.hasPhoto ? 1 : 0,
    obs.location.latitude,
    obs.location.longitude,
    obs.location.addressOrLandmark,
    obs.location.accuracyMeters,
    obs.location.isApproximate ? 1 : 0,
    obs.timestamp,
    obs.aiAnalysis ? JSON.stringify(obs.aiAnalysis) : null,
    JSON.stringify(obs.userReview),
    obs.isSampleExample ? 1 : 0,
    obs.createdAt,
    obs.updatedAt
  );

  return obs;
}

export function deleteObservation(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM observations WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getAllWalks(): WalkSession[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM walk_sessions ORDER BY started_at DESC');
  const rows = stmt.all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    startedAt: r.started_at,
    endedAt: r.ended_at || null,
    targetDurationMinutes: Number(r.target_duration_minutes),
    focus: r.focus,
    observationsCount: Number(r.observations_count),
    checklist: JSON.parse(r.checklist_json),
    status: r.status,
    notes: r.notes || '',
  }));
}

export function saveWalkSession(walk: WalkSession): WalkSession {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO walk_sessions (
      id, title, started_at, ended_at, target_duration_minutes,
      focus, observations_count, checklist_json, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      ended_at = excluded.ended_at,
      observations_count = excluded.observations_count,
      checklist_json = excluded.checklist_json,
      status = excluded.status,
      notes = excluded.notes
  `);

  stmt.run(
    walk.id,
    walk.title,
    walk.startedAt,
    walk.endedAt,
    walk.targetDurationMinutes,
    walk.focus,
    walk.observationsCount,
    JSON.stringify(walk.checklist),
    walk.status,
    walk.notes
  );

  return walk;
}

// Seed 3 clearly-marked reference examples (clearly labeled isSampleExample = true)
function seedExamplesIfEmpty(db: DatabaseSync) {
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM observations').get() as any;
  if (countRow && countRow.cnt > 0) return;

  const now = new Date();
  const sample1: Observation = {
    id: 'MM-SAMPLE-001',
    walkId: null,
    category: 'waterlogging',
    title: 'Standing Rainwater Pool Over Curb Ramp',
    userNote: 'Puddle covers entire handicap ramp at 4th & Elm intersection. Pedestrians forced into vehicular traffic lane.',
    description: 'Persistent 3-4 meter standing rainwater pool submerging the pedestrian curb ramp. Pedestrians and stroller users are forced to step around the curb into the active vehicular lane.',
    imageUrl: null,
    hasPhoto: false,
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      addressOrLandmark: 'Corner of 4th Ave & Elm St (Pedestrian Crossing)',
      accuracyMeters: 12,
      isApproximate: false,
    },
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      suggestedCategory: 'waterlogging',
      evidenceSummary: 'Clear standing pool across walkway connection. Water level submerged the drop-curb slope.',
      observableSeverityIndicators: [
        'Entire sidewalk ramp cut is submerged',
        'Pedestrian detour requires walking in roadway',
      ],
      severityLevel: 'high',
      confidenceScore: 0.92,
      confidenceRationale: 'High confidence based on visible path blockage and vehicle lane proximity.',
      suggestedFollowups: [
        'Inspect curb inlet grate for debris blockages',
        'Record if water clears within 4 hours after rainfall stops',
      ],
      questionsForHumanVerifier: [
        'Does the puddle persist when rain has stopped for > 6 hours?',
      ],
      openSourceModelUsed: 'Gemma 3 Vision (Simulated Example)',
      isDemoFallback: true,
      analyzedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    userReview: {
      status: 'verified',
      reviewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 120000).toISOString(),
      userCorrectionsMade: false,
      correctionNotes: null,
    },
    isSampleExample: true,
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  };

  const sample2: Observation = {
    id: 'MM-SAMPLE-002',
    walkId: null,
    category: 'blocked_drainage',
    title: 'Plastic Silt Grate Choked at Stormwater Inlet',
    userNote: 'Storm drain inlet clogged with wet leaves, plastic bottles, and silt bag debris.',
    description: 'Roadside stormwater inlet grate is choked by accumulated silt, organic leaf debris, and single-use plastic waste. Inflow velocity reduced to a trickle.',
    imageUrl: null,
    hasPhoto: false,
    location: {
      latitude: 12.9734,
      longitude: 77.5978,
      addressOrLandmark: 'Westbound Bus Stop, Market St',
      accuracyMeters: 15,
      isApproximate: false,
    },
    timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      suggestedCategory: 'blocked_drainage',
      evidenceSummary: 'Grate openings approximately 75% occluded by solid litter and organic runoff.',
      observableSeverityIndicators: [
        'Over 70% of intake surface blocked',
        'Water pooling upstream along roadside gutter',
      ],
      severityLevel: 'medium',
      confidenceScore: 0.88,
      confidenceRationale: 'Debris covering surface is clearly visible on drain intake.',
      suggestedFollowups: [
        'Check if neighboring grates along the street are also occluded',
        'Notify community cleanup group or local municipal helpline',
      ],
      questionsForHumanVerifier: [
        'Is the blockage only on top of the grate or inside the sump below?',
      ],
      openSourceModelUsed: 'Gemma 3 Vision (Simulated Example)',
      isDemoFallback: true,
      analyzedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    },
    userReview: {
      status: 'verified',
      reviewedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000 + 150000).toISOString(),
      userCorrectionsMade: true,
      correctionNotes: 'Confirmed silt depth is approximately 3 inches.',
    },
    isSampleExample: true,
    createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
  };

  const sample3: Observation = {
    id: 'MM-SAMPLE-003',
    walkId: null,
    category: 'damaged_footpath',
    title: 'Dislodged Paver Slabs Creating Trip Hazards in Rain',
    userNote: 'Three large sidewalk pavers broken and shifting underfoot. In rain, muddy water squirts up when stepped on.',
    description: 'Multiple dislodged concrete pavers along pedestrian sidewalk. Paving base washed out by rain runoff, creating unstable surfaces and severe trip hazards.',
    imageUrl: null,
    hasPhoto: false,
    location: {
      latitude: 12.9698,
      longitude: 77.5912,
      addressOrLandmark: 'Park Avenue, Opposite Library Gate',
      accuracyMeters: 8,
      isApproximate: false,
    },
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      suggestedCategory: 'damaged_footpath',
      evidenceSummary: 'Broken paver blocks with missing joint sand and soil erosion underneath.',
      observableSeverityIndicators: [
        'Uneven height step exceeds 4 cm',
        'Surface unstable when weight applied',
      ],
      severityLevel: 'medium',
      confidenceScore: 0.85,
      confidenceRationale: 'Physical fracture and displaced stones visible.',
      suggestedFollowups: [
        'Note whether elderly pedestrians or runners avoid this sidewalk side',
      ],
      questionsForHumanVerifier: [
        'Is the foundation eroding towards the roadway?',
      ],
      openSourceModelUsed: 'Gemma 3 Vision (Simulated Example)',
      isDemoFallback: true,
      analyzedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    userReview: {
      status: 'verified',
      reviewedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000 + 90000).toISOString(),
      userCorrectionsMade: false,
      correctionNotes: null,
    },
    isSampleExample: true,
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
  };

  saveObservation(sample1);
  saveObservation(sample2);
  saveObservation(sample3);
}
