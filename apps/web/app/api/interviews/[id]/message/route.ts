import { NextResponse } from 'next/server';
import { getSessionById, createMessage, getMessagesBySessionId } from '@/lib/services/db.service';
import { generateNextResponse } from '@/lib/services/ai-engine/interviewer';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;
    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: `Interview session "${sessionId}" not found.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing or invalid "message" field. Must be a non-empty string.' },
        { status: 400 }
      );
    }

    const existingMessages = await getMessagesBySessionId(sessionId);
    const nextOrder = existingMessages.length + 1;

    // Save candidate's message to Supabase
    await createMessage({
      session_id: sessionId,
      sender_role: 'user',
      content: message.trim(),
      sequence_order: nextOrder,
    });

    let aiResponse = '';
    try {
      aiResponse = await generateNextResponse(sessionId, message.trim());
    } catch (aiErr: any) {
      console.warn('[api/interviews/message] AI generation fallback:', aiErr?.message);
      if (session.type === 'behavioral') {
        aiResponse = `Thank you for walking me through that situation. You highlighted the actions well. To dig a little deeper into the Result aspect of the STAR method, what were the quantifiable metrics or long-term impacts of the decisions you made?`;
      } else {
        aiResponse = `That's a sound initial approach. Now, let's explore optimization and edge cases. If the incoming traffic or data volume were to increase by a factor of 100x, where would the primary bottleneck emerge in this design, and how would you mitigate it?`;
      }
    }

    // Save AI interviewer's reply to Supabase
    await createMessage({
      session_id: sessionId,
      sender_role: 'ai',
      content: aiResponse,
      sequence_order: nextOrder + 1,
    });

    return NextResponse.json({ message: aiResponse }, { status: 200 });
  } catch (err: any) {
    console.error('[api/interviews/message] Error processing message:', err);
    return NextResponse.json(
      { error: 'Error', message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
