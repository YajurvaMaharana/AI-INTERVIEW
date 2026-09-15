import { NextResponse } from 'next/server';
import { getSessionById, getMessagesBySessionId, updateSession } from '@/lib/services/db.service';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: `Interview session "${sessionId}" not found.` },
        { status: 404 }
      );
    }

    const messages = await getMessagesBySessionId(sessionId);

    return NextResponse.json({ session, messages }, { status: 200 });
  } catch (err: any) {
    console.error('[api/interviews/[id]] GET error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err?.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await req.json().catch(() => ({}));
    const updated = await updateSession(sessionId, body);

    return NextResponse.json({ session: updated }, { status: 200 });
  } catch (err: any) {
    console.error('[api/interviews/[id]] PATCH error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err?.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
