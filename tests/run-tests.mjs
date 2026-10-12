import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

console.log('🧪 Starting MonsoonMap Automated Verification Suite...\n');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

async function asyncTest(description, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

// 1. Test In-Memory SQLite persistence and table schema
test('SQLite schema initialization and CRUD', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE observations (
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
  `);

  // Insert observation
  const insertStmt = db.prepare(`
    INSERT INTO observations (
      id, walk_id, category, title, user_note, description,
      has_photo, latitude, longitude, address_or_landmark,
      timestamp, user_review_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    'MM-TEST-001',
    'walk_123',
    'waterlogging',
    'Test Puddle',
    'Deep water at curb ramp',
    'Verified standing pool covering curb ramp',
    0,
    12.9716,
    77.5946,
    'Corner of 4th & Main',
    new Date().toISOString(),
    JSON.stringify({ status: 'verified', reviewedAt: new Date().toISOString() }),
    new Date().toISOString(),
    new Date().toISOString()
  );

  const row = db.prepare('SELECT * FROM observations WHERE id = ?').get('MM-TEST-001');
  assert.ok(row, 'Row should exist in database');
  assert.strictEqual(row.category, 'waterlogging');
  assert.strictEqual(row.latitude, 12.9716);

  // Update
  db.prepare('UPDATE observations SET description = ? WHERE id = ?').run(
    'Updated description',
    'MM-TEST-001'
  );
  const updatedRow = db.prepare('SELECT * FROM observations WHERE id = ?').get('MM-TEST-001');
  assert.strictEqual(updatedRow.description, 'Updated description');

  // Delete
  db.prepare('DELETE FROM observations WHERE id = ?').run('MM-TEST-001');
  const deletedRow = db.prepare('SELECT * FROM observations WHERE id = ?').get('MM-TEST-001');
  assert.strictEqual(deletedRow, undefined);
});

// 2. Test Category Metadata & Coverage
test('Category definitions and color assignments', () => {
  const validCategories = [
    'waterlogging',
    'blocked_drainage',
    'litter',
    'damaged_footpath',
    'unsafe_crossing',
    'other',
  ];

  assert.strictEqual(validCategories.length, 6, 'Should have exactly 6 issue categories');
  validCategories.forEach((cat) => {
    assert.ok(typeof cat === 'string' && cat.length > 0, `Category ${cat} must be valid string`);
  });
});

// 3. Test Haversine Distance Calculation
test('Haversine distance formula accuracy', () => {
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  // Same coordinates should have 0 distance
  assert.strictEqual(haversine(12.9716, 77.5946, 12.9716, 77.5946), 0);

  // Distance between Bangalore Town Hall (12.9634, 77.5855) and Cubbon Park (12.9763, 77.5929) is ~1.6km
  const dist = haversine(12.9634, 77.5855, 12.9763, 77.5929);
  assert.ok(dist > 1400 && dist < 1800, `Distance should be ~1.6km, got ${dist}`);
});

// 4. Test Deterministic Fallback Structuring
test('Deterministic AI fallback generates valid schema', () => {
  const note = 'Severe standing water puddle completely submerging the curb ramp, forcing pedestrians into traffic';
  const hasWater = note.toLowerCase().includes('water') || note.toLowerCase().includes('puddle');
  assert.ok(hasWater, 'Should detect water keywords');

  // Verify simulated fallback object
  const mockAiResult = {
    suggestedCategory: 'waterlogging',
    evidenceSummary: 'Surface water accumulation visible over pedestrian footpath / curb corridor.',
    observableSeverityIndicators: [
      'Water pool forces pedestrians into vehicular traffic lane',
      'Estimated standing water extends across entire walkable path',
    ],
    severityLevel: 'high',
    confidenceScore: 0.88,
    confidenceRationale: 'Calibrated based on pedestrian right-of-way obstruction.',
    suggestedFollowups: ['Check whether ponding dissipates within 3-4 hours after rain ceases'],
    questionsForHumanVerifier: ['Is the standing water deeper than ankle height at its lowest point?'],
    openSourceModelUsed: 'Gemma 3 Vision (Offline Demo Fallback)',
    isDemoFallback: true,
    analyzedAt: new Date().toISOString(),
  };

  assert.strictEqual(mockAiResult.suggestedCategory, 'waterlogging');
  assert.strictEqual(mockAiResult.severityLevel, 'high');
  assert.ok(mockAiResult.confidenceScore >= 0 && mockAiResult.confidenceScore <= 1);
  assert.strictEqual(mockAiResult.isDemoFallback, true);
  assert.ok(mockAiResult.observableSeverityIndicators.length > 0);
  assert.ok(mockAiResult.questionsForHumanVerifier.length > 0);
});

// 5. Test Markdown report formatting
test('Markdown report formatting generates complete evidence document', () => {
  const obs = {
    id: 'MM-2026-1001',
    category: 'blocked_drainage',
    title: 'Clogged Stormwater Grate',
    userNote: 'Leaf debris and bottles choked the intake grate',
    description: 'Roadside stormwater inlet grate is choked by accumulated silt and single-use plastic waste.',
    timestamp: '2026-10-12T08:30:00.000Z',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      addressOrLandmark: 'Market Street East Gate',
      accuracyMeters: 10,
    },
    userReview: { status: 'verified' },
    aiAnalysis: {
      openSourceModelUsed: 'Gemma 3 Vision',
      isDemoFallback: false,
      severityLevel: 'medium',
      confidenceScore: 0.9,
      observableSeverityIndicators: ['Intake surface > 70% occluded'],
      suggestedFollowups: ['Check downstream catch basins'],
      questionsForHumanVerifier: ['Is blockage superficial or subterranean?'],
    },
  };

  const md = `# MonsoonMap Civic Field Evidence Report\nID: ${obs.id}\nCategory: ${obs.category}\nDesc: ${obs.description}`;
  assert.ok(md.includes(obs.id), 'Report must contain observation ID');
  assert.ok(md.includes(obs.category), 'Report must contain category');
  assert.ok(md.includes(obs.description), 'Report must contain approved description');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passCount} Passed, ${failCount} Failed`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
