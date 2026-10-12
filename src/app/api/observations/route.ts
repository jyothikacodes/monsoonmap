import { NextRequest, NextResponse } from 'next/server';
import { getAllObservations, saveObservation } from '@/lib/db';
import { Observation, IssueCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeSamples = searchParams.get('includeSamples') !== 'false';
    const observations = getAllObservations(includeSamples);
    return NextResponse.json({
      success: true,
      count: observations.length,
      observations,
    });
  } catch (error: any) {
    console.error('Failed to list observations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list observations.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const category = body.category as IssueCategory;
    if (!category) {
      return NextResponse.json({ error: 'Issue category is required.' }, { status: 400 });
    }

    const userNote = (body.userNote || '').trim();
    const description = (body.description || userNote || 'Observation recorded during field walk.').trim();

    const now = new Date().toISOString();
    const id = body.id || `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const observation: Observation = {
      id,
      walkId: body.walkId || null,
      category,
      title: body.title || `${category.replace('_', ' ').toUpperCase()} Observation`,
      userNote,
      description,
      imageUrl: body.imageUrl || null,
      hasPhoto: Boolean(body.imageUrl),
      location: {
        latitude: body.location?.latitude !== undefined ? Number(body.location.latitude) : null,
        longitude: body.location?.longitude !== undefined ? Number(body.location.longitude) : null,
        addressOrLandmark: body.location?.addressOrLandmark || null,
        accuracyMeters: body.location?.accuracyMeters || null,
        isApproximate: Boolean(body.location?.isApproximate),
      },
      timestamp: body.timestamp || now,
      aiAnalysis: body.aiAnalysis || null,
      userReview: body.userReview || {
        status: 'verified',
        reviewedAt: now,
        userCorrectionsMade: false,
        correctionNotes: null,
      },
      isSampleExample: Boolean(body.isSampleExample),
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const saved = saveObservation(observation);
    return NextResponse.json({ success: true, observation: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create observation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save observation.' },
      { status: 500 }
    );
  }
}
