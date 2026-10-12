import { Observation, WalkFocus, ChecklistItem } from './types';

export const CHECKLISTS_BY_FOCUS: Record<WalkFocus, Array<{ label: string; hint: string }>> = {
  rainfall_waterlogging: [
    {
      label: 'Standing water obstructing footpath',
      hint: 'Look for puddles forcing pedestrians into vehicular road traffic.',
    },
    {
      label: 'Curb ramp / disability ramp submerged',
      hint: 'Inspect intersection corners where sidewalk meets the road.',
    },
    {
      label: 'Roadside gutter pool extending past curb',
      hint: 'Check if standing water depth exceeds 2-3 inches.',
    },
    {
      label: 'Water pooling near bus stop or transit entrance',
      hint: 'Document areas where commuters cannot queue safely.',
    },
  ],
  blocked_drainage: [
    {
      label: 'Stormwater grate choked with silt or leaves',
      hint: 'Check if debris is occluding >50% of the grate opening.',
    },
    {
      label: 'Plastic litter accumulation in gutter',
      hint: 'Look for plastic bags or bottles trapped at intake points.',
    },
    {
      label: 'Missing or damaged drain cover',
      hint: 'Severe safety hazard; document open drop hazards.',
    },
    {
      label: 'Culvert inlet blocked by construction debris',
      hint: 'Check neighborhood runoff discharge channels.',
    },
  ],
  litter_waste: [
    {
      label: 'Solid waste dump obstructing pedestrian path',
      hint: 'Look for uncollected refuse spilling onto sidewalks.',
    },
    {
      label: 'Single-use plastic runoff accumulation',
      hint: 'Note where stormwater wash creates plastic bottlenecks.',
    },
    {
      label: 'Overflowing public trash receptacle',
      hint: 'Check if litter is blowing into storm drains.',
    },
    {
      label: 'Hazardous glass or construction rubble on walkway',
      hint: 'Document sharp objects creating pedestrian risks.',
    },
  ],
  footpath_safety: [
    {
      label: 'Dislodged or cracked paving slabs',
      hint: 'Look for wobbly tiles that squirt muddy water when stepped on.',
    },
    {
      label: 'Uneven curb step or sudden drop-off',
      hint: 'Inspect sidewalk continuity and trip hazards.',
    },
    {
      label: 'Pothole or trench in walkable area',
      hint: 'Check for unfilled utility cuts or washouts.',
    },
    {
      label: 'Vegetation or branches blocking passage',
      hint: 'Note low-hanging wet branches forcing pedestrians off path.',
    },
  ],
  general: [
    {
      label: 'Pedestrian right-of-way safety check',
      hint: 'Can a person with a stroller walk 100 meters unobstructed?',
    },
    {
      label: 'Stormwater drainage flow check',
      hint: 'Is surface runoff moving freely towards drains?',
    },
    {
      label: 'Footpath surface integrity',
      hint: 'Are walking surfaces slip-resistant and well-graded?',
    },
    {
      label: 'Crosswalk accessibility',
      hint: 'Are pedestrian street crossings dry and clearly navigable?',
    },
  ],
};

export function getDefaultChecklist(focus: WalkFocus): ChecklistItem[] {
  const templates = CHECKLISTS_BY_FOCUS[focus] || CHECKLISTS_BY_FOCUS.general;
  return templates.map((item, idx) => ({
    id: `chk_${idx}_${Date.now()}`,
    label: item.label,
    hint: item.hint,
    checked: false,
  }));
}

/**
 * Resizes and compresses an image in-browser using HTML5 Canvas.
 * Keeps memory low and ensures ultra-fast transmission even over mobile data.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use webp if supported, else fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Haversine formula to compute distance in meters between two lat/lon coordinates.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
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

/**
 * Friendly timestamp formatting
 */
export function formatFriendlyDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoDate;
  }
}

/**
 * Generates structured Markdown representation of an observation for sharing
 */
export function generateMarkdownReport(obs: Observation): string {
  const lines: string[] = [
    `# MonsoonMap Civic Field Evidence Report`,
    `**Observation ID:** \`${obs.id}\``,
    `**Date & Time:** ${formatFriendlyDate(obs.timestamp)}`,
    `**Category:** ${obs.category.replace('_', ' ').toUpperCase()}`,
    `**Review Status:** ${obs.userReview.status.toUpperCase()} (Reviewed by resident walker)`,
    ``,
    `---`,
    `## Summary of Observed Condition`,
    `> ${obs.description}`,
    ``,
    `### Resident Field Note`,
    `"${obs.userNote}"`,
    ``,
  ];

  if (obs.location.latitude && obs.location.longitude) {
    lines.push(
      `### Location Details`,
      `- **Coordinates:** ${obs.location.latitude.toFixed(5)}, ${obs.location.longitude.toFixed(5)}`,
      `- **Landmark / Context:** ${obs.location.addressOrLandmark || 'Neighborhood walking corridor'}`,
      `- **Accuracy:** ~${obs.location.accuracyMeters ? Math.round(obs.location.accuracyMeters) : 10}m`,
      ``
    );
  }

  if (obs.aiAnalysis) {
    lines.push(
      `### Structured Physical Evidence (Open-Source AI Assistance)`,
      `*Model: ${obs.aiAnalysis.openSourceModelUsed} (${obs.aiAnalysis.isDemoFallback ? 'Demo Mode' : 'Live Inference'})*`,
      `- **Observable Indicators:**`,
      ...obs.aiAnalysis.observableSeverityIndicators.map((s) => `  - ${s}`),
      `- **Assessed Severity Level:** ${obs.aiAnalysis.severityLevel.toUpperCase()}`,
      `- **Confidence Score:** ${(obs.aiAnalysis.confidenceScore * 100).toFixed(0)}%`,
      `- **Suggested Follow-up Observations:**`,
      ...obs.aiAnalysis.suggestedFollowups.map((s) => `  - ${s}`),
      `- **Questions for Human Verifier:**`,
      ...obs.aiAnalysis.questionsForHumanVerifier.map((s) => `  - ${s}`),
      ``
    );
  }

  lines.push(
    `---`,
    `*Notice: This is an independent civic field observation report generated by a resident walker using MonsoonMap. It documents observable physical conditions in public spaces and does not constitute an official municipal response or government record.*`
  );

  return lines.join('\n');
}
