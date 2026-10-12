import { NextRequest, NextResponse } from 'next/server';
import { getAllWalks, saveWalkSession } from '@/lib/db';
import { WalkSession } from '@/lib/types';

export async function GET() {
  try {
    const walks = getAllWalks();
    return NextResponse.json({ success: true, walks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list walks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.startedAt) {
      return NextResponse.json(
        { error: 'Walk title and start time are required' },
        { status: 400 }
      );
    }

    const walk: WalkSession = {
      id: body.id || `walk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: body.title,
      startedAt: body.startedAt,
      endedAt: body.endedAt || null,
      targetDurationMinutes: Number(body.targetDurationMinutes) || 20,
      focus: body.focus || 'rainfall_waterlogging',
      observationsCount: Number(body.observationsCount) || 0,
      checklist: Array.isArray(body.checklist) ? body.checklist : [],
      status: body.status || 'completed',
      notes: body.notes || '',
    };

    const saved = saveWalkSession(walk);
    return NextResponse.json({ success: true, walk: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save walk session' },
      { status: 500 }
    );
  }
}
