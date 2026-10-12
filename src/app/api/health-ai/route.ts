import { NextResponse } from 'next/server';
import { checkAiHealth } from '@/lib/ai-analyzer';

export async function GET() {
  try {
    const health = await checkAiHealth();
    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      {
        isAvailable: false,
        provider: 'ollama',
        message: error.message || 'Unable to check AI endpoint.',
      },
      { status: 500 }
    );
  }
}
