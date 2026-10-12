import { NextRequest, NextResponse } from 'next/server';
import { getObservationById, saveObservation, deleteObservation } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const observation = getObservationById(id);
    if (!observation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, observation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve observation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getObservationById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }

    const updates = await req.json();
    const updated = {
      ...existing,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    saveObservation(updated);
    return NextResponse.json({ success: true, observation: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update observation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteObservation(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Observation not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete observation' },
      { status: 500 }
    );
  }
}
