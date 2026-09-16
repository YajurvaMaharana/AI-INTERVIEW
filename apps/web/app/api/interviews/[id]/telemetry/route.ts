import { NextResponse } from 'next/server';
import { getSessionById } from '@/lib/services/db.service';
import { getOrCreateSessionTelemetry } from '@/lib/services/ai-engine/adaptive-engine.service';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const session = await getSessionById(sessionId);

    const type = session?.type || 'technical';
    const difficulty = session?.difficulty || 'medium';

    const telemetry = getOrCreateSessionTelemetry(sessionId, type, difficulty);

    return NextResponse.json({ telemetry }, { status: 200 });
  } catch (err: any) {
    console.error('[api/interviews/telemetry] Error fetching telemetry:', err);
    return NextResponse.json(
      { error: 'Error', message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
