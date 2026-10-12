import { NextRequest, NextResponse } from 'next/server';
import { analyzeObservation, checkAiHealth } from '@/lib/ai-analyzer';
import { IssueCategory } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userNote, categoryHint, imageBase64, locationHint } = body;

    if (!userNote && !imageBase64) {
      return NextResponse.json(
        { error: 'Observation requires at least a field note or a photograph.' },
        { status: 400 }
      );
    }

    // Safety check on base64 size (max ~8MB in payload)
    if (imageBase64 && imageBase64.length > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds maximum upload limit of 8MB. Please compress before submitting.' },
        { status: 413 }
      );
    }

    const analysis = await analyzeObservation({
      userNote: userNote || '',
      categoryHint: categoryHint as IssueCategory,
      imageBase64: imageBase64 || null,
      locationHint: locationHint || null,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('API /api/analyze-observation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal analysis error occurred.' },
      { status: 500 }
    );
  }
}
