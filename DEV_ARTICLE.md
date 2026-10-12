This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

# MonsoonMap: Walk Your Streets. Expose the Problems. Make the Evidence Count.

---

## What I Built

**MonsoonMap** is a civic-tech field companion that turns outdoor neighborhood walks into structured, human-verified environmental evidence.

Every monsoon or heavy rain shower transforms our streets into obstacle courses:
- Pedestrian curb ramps submerge under four inches of stagnant water, forcing wheelchair users and parents with strollers directly into active vehicular traffic.
- Roadside stormwater grates choke on plastic wrappers and leaf silt, causing runoff backflow.
- Concrete pavers dislodge into muddy trip hazards.

Yet, most civic frustration dissolves into vague social media complaints (*"my street is flooded"*). Municipal ward engineers and community assemblies lack structured, verifiable physical evidence to prioritize interventions.

### How it gets people off the screen and into the world

MonsoonMap was intentionally designed **against** continuous screen time:
1. **Targeted Outdoor Walk Sessions**: Citizens start a 10, 20, or 30-minute walk focused on a specific environmental issue (*Rainfall & Waterlogging*, *Drainage & Inlets*, *Footpath & Pavement*, or *Runoff Litter*).
2. **Dedicated "Pocket Mode"**: The moment your walk begins, you tap *Pocket Mode*. The screen dims into a minimalist, low-power heads-up display. The app tells you: **"Keep your phone in your pocket and observe your surroundings."** MonsoonMap keeps track of your time in the background so you can look at the real world.
3. **Contextual Observation Checklists**: Instead of distracting forms, small field prompts guide your eyes: *"Look for standing water forcing pedestrians off sidewalks"*, *"Check if debris is occluding >50% of the intake grate"*.
4. **Fast Capture & Pocket**: When you discover an obstacle, you take a quick photograph, add a single-sentence note, and put your phone right back into your pocket.
5. **Post-Walk Human Review**: Only after you finish your walk do you review the findings, correct any AI classifications, and generate an evidence document.

### Who is it for?
Everyday walking residents, neighborhood associations, ward committees, pedestrian safety advocates, and local civic volunteer groups who want evidence that counts.

---

## Demo

- **Live Deployed Web Application**: [https://monsoonmap.vercel.app](https://monsoonmap.vercel.app)
- **Full Source Code**: [https://github.com/jyothikacodes/monsoonmap](https://github.com/jyothikacodes/monsoonmap)
- **Local Dev Endpoint**: `http://localhost:3005`

### The Core Walkthrough

1. **Outdoor Walk Setup**: Choose a 20-minute route with a focus on *Rainfall & Waterlogging*.
2. **Pocket Mode & Street Walking**: Put the phone in your pocket; the timer runs unobtrusively in the background.
3. **Field Capture**: Spot a submerged curb ramp, snap a picture, and jot: *"Puddle 4 inches deep covering entire crosswalk ramp, forcing pedestrians with strollers into traffic."*
4. **Client-Side Compression**: High-res smartphone camera photos (8–15 MB) are compressed on-device in HTML5 Canvas to ~180 KB in milliseconds.
5. **Open-Weight AI Structuring**: The local vision model extracts observable physical factors, isolates facts from assumptions, and suggests follow-up checks.
6. **Citizen Verification**: You review the structured findings, adjust severity, confirm your field note, and approve the observation.
7. **Map & Civic Evidence Report**: View the geotagged record with custom color-coded category markers on OpenStreetMap, check for nearby clusters within 150m, and export a clean printable PDF or copyable Markdown report for your local ward assembly.

---

## Code

The complete source code is open source under the MIT License:

{% github jyothikacodes/monsoonmap %}

### Key Architectural Components

- **[`src/lib/ai-analyzer.ts`](https://github.com/jyothikacodes/monsoonmap/blob/main/src/lib/ai-analyzer.ts)**: Local Ollama adapter connecting to Gemma 3 Vision with strict JSON schema validation and transparent fallback engineering.
- **[`src/app/walk/page.tsx`](https://github.com/jyothikacodes/monsoonmap/blob/main/src/app/walk/page.tsx)**: Outdoor walk interface featuring duration goals, focus checklists, and battery-friendly Pocket Mode.
- **[`src/components/ObservationsMap.tsx`](https://github.com/jyothikacodes/monsoonmap/blob/main/src/components/ObservationsMap.tsx)**: Interactive Leaflet OpenStreetMap integration with custom SVG markers and cluster detection.
- **[`src/lib/db.ts`](https://github.com/jyothikacodes/monsoonmap/blob/main/src/lib/db.ts)**: Embedded SQLite persistence powered by Node.js built-in `node:sqlite`.
- **[`src/lib/client-utils.ts`](https://github.com/jyothikacodes/monsoonmap/blob/main/src/lib/client-utils.ts)**: In-browser canvas image compression, Haversine proximity calculations, and markdown evidence report generator.

---

## How I Built It

MonsoonMap is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Leaflet / OpenStreetMap**, and **Node.js `node:sqlite`**.

### The Open-Source AI Pipeline: Gemma 3 Vision

At the heart of MonsoonMap is **Google's open-weight Gemma 3 Vision model (`gemma3:4b-instruct`)** running locally through **Ollama**.

#### Disciplined Evidence Separation
Civic reports require rigorous physical discipline. We engineered our prompts and schema to strictly separate **directly observable physical facts** from **speculative assumptions**:
- **Observable Physical Indicators**: Identifies visible factors such as *"Standing water covers 100% of the curb ramp cut"* or *"Intake grate surface is >70% occluded by plastic and silt"*.
- **Refusal to Speculate**: If the image shows standing water, the system identifies the puddle but explicitly refuses to claim that the underground municipal drainage pipe is broken unless visual evidence shows active backflow.
- **Verification Questions for the Human**: Prompts the walking citizen with clarifying questions: *"Does the water persist after 4 hours of dry weather?"*, *"Is the blockage superficial leaf debris or an internal culvert choke?"*.

```json
{
  "suggestedCategory": "waterlogging",
  "evidenceSummary": "Surface water accumulation visible over pedestrian footpath / curb corridor.",
  "observableSeverityIndicators": [
    "Water pool forces pedestrians into vehicular traffic lane",
    "Estimated standing water extends across entire walkable path"
  ],
  "severityLevel": "high",
  "confidenceScore": 0.88,
  "confidenceRationale": "High confidence based on visible path blockage and vehicle lane proximity.",
  "suggestedFollowups": [
    "Check whether ponding dissipates within 3-4 hours after rain ceases",
    "Inspect nearby curb drop-inlets for surface occlusions"
  ],
  "questionsForHumanVerifier": [
    "Is the standing water deeper than ankle height at its lowest point?"
  ]
}
```

#### Transparent Fallback Engineering
If a user runs MonsoonMap on hardware without Ollama or GPU resources, the application **never pretends AI is working**.
- When Ollama is running with Gemma 3: Displays `Gemma 3 Vision (Live Inference)`.
- When offline: Falls back to deterministic heuristic parsing with an explicit badge: `Gemma 3 Vision (Offline Demo Fallback)`.
The entire civic workflow—walk timer, checklists, compression, human review, mapping, proximity detection, and PDF evidence export—remains 100% functional offline.

---

## Why Does Open Innovation Matter?

When documenting local public infrastructure, using proprietary hosted AI APIs presents serious ethical and practical hurdles:

1. **Civic Privacy & Non-Surveillance**: When residents document their daily walking routes and neighborhood corners, those photographs should never be sent to commercial cloud providers for training or telemetry. Open-weight models running on local hardware ensure that community observations remain strictly under the user's control.
2. **Zero Vendor Lock-In & Perpetual Access**: Community assemblies and civic volunteer groups operate with zero software budget. They cannot depend on proprietary APIs that require paid subscriptions or suddenly deprecate endpoints. Open-weight models like Gemma 3 guarantee permanent availability.
3. **Auditable Civic Trust**: When presenting field evidence to municipal authorities, the structuring pipeline must be transparent. Open models allow full scrutiny of prompt constraints, eliminating commercial black-box bias.

---

## My Agent Session

<!-- Optional, but judges love it. Save your session with DevRelay and embed it with the agent_session tag, or link to it here: -->
<!-- {% agent_session <session-id> %} -->

This project was built pair-programming with the autonomous coding agent Antigravity, which planned the civic-tech product architecture, configured the Next.js 16 and SQLite persistence layers, integrated the Gemma 3 Ollama pipeline with deterministic fallback handling, and implemented the automated test suite.

---

## Prize Categories

- **Touch Grass (Week 1)**: Primary category — outdoor walk mode, contextual checklists, screen-dimming Pocket Mode designed to put phones away, and post-walk evidence verification.
- **Open-Weight Models**: Local Gemma 3 Vision integration via Ollama with strict evidence schemas and transparent diagnostic fallback.
