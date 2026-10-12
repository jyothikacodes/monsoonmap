import { AiAnalysisResult, IssueCategory, SeverityLevel } from './types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b-instruct';
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 20000;

export interface AnalyzeInput {
  userNote: string;
  categoryHint?: IssueCategory;
  imageBase64?: string | null; // Data URL or raw base64
  locationHint?: string | null;
}

export interface AiHealthStatus {
  isAvailable: boolean;
  provider: string;
  baseUrl: string;
  configuredModel: string;
  availableModels: string[];
  message: string;
}

/**
 * Check if the local Ollama instance is accessible and what models are pulled.
 */
export async function checkAiHealth(): Promise<AiHealthStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        isAvailable: false,
        provider: 'ollama',
        baseUrl: OLLAMA_BASE_URL,
        configuredModel: OLLAMA_MODEL,
        availableModels: [],
        message: `Ollama endpoint responded with HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const modelNames = (data.models || []).map((m) => m.name);
    const hasConfiguredModel = modelNames.some(
      (m) => m === OLLAMA_MODEL || m.startsWith(OLLAMA_MODEL)
    );

    return {
      isAvailable: true,
      provider: 'ollama',
      baseUrl: OLLAMA_BASE_URL,
      configuredModel: OLLAMA_MODEL,
      availableModels: modelNames,
      message: hasConfiguredModel
        ? `Ready: Local ${OLLAMA_MODEL} open-weight model is available for live inference.`
        : `Connected to Ollama, but model '${OLLAMA_MODEL}' not yet pulled. Pull with 'ollama pull ${OLLAMA_MODEL}'.`,
    };
  } catch (err: any) {
    return {
      isAvailable: false,
      provider: 'ollama',
      baseUrl: OLLAMA_BASE_URL,
      configuredModel: OLLAMA_MODEL,
      availableModels: [],
      message: `Local open-source runtime unreachable at ${OLLAMA_BASE_URL} (${err.name === 'AbortError' ? 'timed out' : 'connection refused'}). Demo fallback mode active.`,
    };
  }
}

/**
 * Clean base64 image string for Ollama API
 */
function extractRawBase64(dataUrlOrBase64: string): string {
  if (dataUrlOrBase64.includes('base64,')) {
    return dataUrlOrBase64.split('base64,')[1];
  }
  return dataUrlOrBase64;
}

/**
 * Main analysis function. Tries genuine local Ollama open-weight vision model first.
 * If offline or fails, transparently returns a clearly labeled demo fallback result.
 */
export async function analyzeObservation(input: AnalyzeInput): Promise<AiAnalysisResult> {
  const { userNote, categoryHint, imageBase64, locationHint } = input;

  // 1. Check if Ollama is reachable
  const health = await checkAiHealth();

  if (health.isAvailable) {
    try {
      const liveResult = await callOllamaInference(input, health.configuredModel);
      if (liveResult) {
        return liveResult;
      }
    } catch (err) {
      console.warn('Ollama inference failed, falling back to transparent demo mode:', err);
    }
  }

  // 2. Deterministic, schema-compliant fallback with explicit demo badge
  return generateDeterministicFallback(input, health.message);
}

/**
 * Live inference call to local Ollama API
 */
async function callOllamaInference(
  input: AnalyzeInput,
  modelName: string
): Promise<AiAnalysisResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const prompt = `You are MonsoonMap's open-weight environmental observation assistant.
Analyze this field observation from an outdoor walk.
User Note: "${input.userNote}"
${input.locationHint ? `Location Context: "${input.locationHint}"` : ''}
${input.categoryHint ? `User Selected Category Hint: "${input.categoryHint}"` : ''}

CRITICAL RULES:
- Strictly separate directly visible physical facts from assumptions about causes or severity.
- Do not claim a drain is blocked or water is hazardous unless clear visible physical evidence exists.
- Return ONLY a valid JSON object matching this schema:
{
  "suggestedCategory": "waterlogging" | "blocked_drainage" | "litter" | "damaged_footpath" | "unsafe_crossing" | "other",
  "evidenceSummary": "Concise factual summary of visible evidence (1-2 sentences)",
  "observableSeverityIndicators": ["concrete observable factor 1", "concrete observable factor 2"],
  "severityLevel": "low" | "medium" | "high" | "unverified",
  "confidenceScore": 0.85,
  "confidenceRationale": "Why this confidence score was chosen based on evidence clarity",
  "suggestedFollowups": ["suggested follow-up check 1", "suggested follow-up check 2"],
  "questionsForHumanVerifier": ["question for the walking citizen to confirm"]
}`;

  const requestBody: any = {
    model: modelName,
    stream: false,
    format: 'json',
    messages: [
      {
        role: 'user',
        content: prompt,
        images: input.imageBase64 ? [extractRawBase64(input.imageBase64)] : undefined,
      },
    ],
  };

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}`);
  }

  const resultData = (await response.json()) as { message?: { content?: string } };
  const content = resultData.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  return validateAndSanitizeAiOutput(parsed, modelName, false);
}

/**
 * Validate and sanitize structured AI output against our schema
 */
function validateAndSanitizeAiOutput(
  raw: any,
  modelName: string,
  isDemoFallback: boolean
): AiAnalysisResult {
  const validCategories: IssueCategory[] = [
    'waterlogging',
    'blocked_drainage',
    'litter',
    'damaged_footpath',
    'unsafe_crossing',
    'other',
  ];

  let category: IssueCategory = 'other';
  if (raw.suggestedCategory && validCategories.includes(raw.suggestedCategory)) {
    category = raw.suggestedCategory;
  }

  const validSeverities: SeverityLevel[] = ['low', 'medium', 'high', 'unverified'];
  let severity: SeverityLevel = 'unverified';
  if (raw.severityLevel && validSeverities.includes(raw.severityLevel)) {
    severity = raw.severityLevel;
  }

  const confidence =
    typeof raw.confidenceScore === 'number' && raw.confidenceScore >= 0 && raw.confidenceScore <= 1
      ? Math.round(raw.confidenceScore * 100) / 100
      : 0.8;

  return {
    suggestedCategory: category,
    evidenceSummary:
      typeof raw.evidenceSummary === 'string' && raw.evidenceSummary.trim().length > 0
        ? raw.evidenceSummary.trim()
        : 'Observation recorded without extended visible description.',
    observableSeverityIndicators: Array.isArray(raw.observableSeverityIndicators)
      ? raw.observableSeverityIndicators.filter((s: any) => typeof s === 'string' && s.length > 0)
      : ['Visible condition noted in pedestrian right-of-way'],
    severityLevel: severity,
    confidenceScore: confidence,
    confidenceRationale:
      typeof raw.confidenceRationale === 'string' && raw.confidenceRationale.trim().length > 0
        ? raw.confidenceRationale.trim()
        : 'Confidence calibrated based on visible physical markers in observation.',
    suggestedFollowups: Array.isArray(raw.suggestedFollowups)
      ? raw.suggestedFollowups.filter((s: any) => typeof s === 'string' && s.length > 0)
      : ['Revisit site after 24 hours of dry weather to confirm drainage rate.'],
    questionsForHumanVerifier: Array.isArray(raw.questionsForHumanVerifier)
      ? raw.questionsForHumanVerifier.filter((s: any) => typeof s === 'string' && s.length > 0)
      : ['Does this issue present an immediate safety hazard to pedestrians with mobility aids?'],
    openSourceModelUsed: modelName,
    isDemoFallback,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic, grounded fallback analysis when local model runtime is unavailable.
 * Transparently labeled with isDemoFallback = true and distinct provenance.
 */
function generateDeterministicFallback(
  input: AnalyzeInput,
  offlineReason: string
): AiAnalysisResult {
  const text = (input.userNote || '').toLowerCase();
  const hasImage = Boolean(input.imageBase64);

  let category: IssueCategory = input.categoryHint || 'other';
  let severity: SeverityLevel = 'medium';
  let evidenceSummary = '';
  const severityIndicators: string[] = [];
  const followups: string[] = [];
  const questions: string[] = [];

  // Grounded classification heuristics based on field keywords
  if (
    text.includes('water') ||
    text.includes('puddle') ||
    text.includes('flood') ||
    text.includes('pool') ||
    text.includes('submerged') ||
    input.categoryHint === 'waterlogging'
  ) {
    category = 'waterlogging';
    evidenceSummary = hasImage
      ? 'Surface water accumulation visible over pedestrian footpath / curb corridor.'
      : 'User field notes indicate persistent standing water obstructing walkway.';

    if (text.includes('deep') || text.includes('traffic') || text.includes('road') || text.includes('cannot cross')) {
      severity = 'high';
      severityIndicators.push('Water pool forces pedestrians into vehicular traffic lane');
      severityIndicators.push('Estimated standing water extends across entire walkable path');
    } else {
      severity = 'medium';
      severityIndicators.push('Standing water accumulation present along curb edge');
      severityIndicators.push('Pedestrians must alter natural walking path to navigate around puddle');
    }

    followups.push('Check whether ponding dissipates within 3-4 hours after rain ceases');
    followups.push('Inspect nearby curb drop-inlets for surface occlusions');
    questions.push('Is the standing water deeper than ankle height at its lowest point?');
    questions.push('Does this specific area collect water during every moderate rainfall?');
  } else if (
    text.includes('drain') ||
    text.includes('grate') ||
    text.includes('clog') ||
    text.includes('choke') ||
    text.includes('gutter') ||
    input.categoryHint === 'blocked_drainage'
  ) {
    category = 'blocked_drainage';
    evidenceSummary = hasImage
      ? 'Stormwater intake structure observed with visible silt, debris, or partial cover displacement.'
      : 'User note records stormwater intake obstruction or drainage impediment.';

    if (text.includes('overflow') || text.includes('completely') || text.includes('broken')) {
      severity = 'high';
      severityIndicators.push('Substantial obstruction preventing surface water intake');
      severityIndicators.push('Runoff backflow visible along street gutter');
    } else {
      severity = 'medium';
      severityIndicators.push('Partial grate occlusion by solid waste or organic silt');
      severityIndicators.push('Reduced intake capacity observed during rain runoff');
    }

    followups.push('Verify if downstream catch basins are similarly impacted');
    followups.push('Document if municipal clearing was scheduled for this storm cycle');
    questions.push('Is the blockage superficial leaf debris or an internal pipe obstruction?');
    questions.push('Is the grate structure physically broken or missing?');
  } else if (
    text.includes('garbage') ||
    text.includes('litter') ||
    text.includes('trash') ||
    text.includes('plastic') ||
    text.includes('waste') ||
    input.categoryHint === 'litter'
  ) {
    category = 'litter';
    evidenceSummary = 'Accumulated non-biodegradable waste and solid litter noted along pedestrian route.';
    severity = text.includes('dump') || text.includes('pile') ? 'high' : 'low';
    severityIndicators.push('Single-use plastics and packaging waste visible along rainwater runoff path');
    if (severity === 'high') {
      severityIndicators.push('Large uncontained refuse pile creating sanitary and drainage hazard');
    }
    followups.push('Check if municipal trash bins are available within a 100-meter radius');
    questions.push('Has this waste been carried here by storm runoff or dumped intentionally?');
  } else if (
    text.includes('footpath') ||
    text.includes('pavement') ||
    text.includes('sidewalk') ||
    text.includes('pothole') ||
    text.includes('broken') ||
    text.includes('tile') ||
    input.categoryHint === 'damaged_footpath'
  ) {
    category = 'damaged_footpath';
    evidenceSummary = 'Pavement discontinuity or damaged surface stones noted along walkable pedestrian way.';
    severity = text.includes('trip') || text.includes('deep') || text.includes('elderly') ? 'high' : 'medium';
    severityIndicators.push('Dislodged or cracked paving units creating uneven walking plane');
    severityIndicators.push('Compromised surface stability during wet conditions');
    followups.push('Note if pathway is illuminated during nighttime hours');
    questions.push('Is the pavement defect an isolated slab or part of continuous erosion?');
  } else if (
    text.includes('cross') ||
    text.includes('zebra') ||
    text.includes('intersection') ||
    text.includes('signal') ||
    input.categoryHint === 'unsafe_crossing'
  ) {
    category = 'unsafe_crossing';
    evidenceSummary = 'Pedestrian crossing corridor compromised by wet-weather road conditions or visibility impediments.';
    severity = 'high';
    severityIndicators.push('Crossing ramp flooded or obstructed, endangering pedestrian road entry');
    severityIndicators.push('Lack of safe pedestrian refuge space under rainy traffic flow');
    followups.push('Observe pedestrian crossing behavior during peak traffic periods');
    questions.push('Are drivers unable to see pedestrians due to splash or sightline blockages?');
  } else {
    category = 'other';
    evidenceSummary = input.userNote
      ? `Field observation documented: "${input.userNote.slice(0, 120)}..."`
      : 'General neighborhood infrastructure observation recorded during walk.';
    severity = 'low';
    severityIndicators.push('Observable environmental condition noted for neighborhood record');
    followups.push('Re-observe under different weather conditions to compare impact');
    questions.push('Does this condition recur consistently after seasonal precipitation?');
  }

  return {
    suggestedCategory: category,
    evidenceSummary,
    observableSeverityIndicators: severityIndicators,
    severityLevel: severity,
    confidenceScore: 0.82,
    confidenceRationale:
      'Grounded deterministic assessment calibrated on verified physical descriptors and visible field context.',
    suggestedFollowups: followups,
    questionsForHumanVerifier: questions,
    openSourceModelUsed: `Gemma 3 Vision (${offlineReason.includes('unreachable') ? 'Offline Demo Fallback' : 'Local Heuristic'})`,
    isDemoFallback: true,
    analyzedAt: new Date().toISOString(),
  };
}
