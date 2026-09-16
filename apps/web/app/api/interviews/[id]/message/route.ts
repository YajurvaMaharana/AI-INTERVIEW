import { NextResponse } from 'next/server';
import { getSessionById, createMessage, getMessagesBySessionId } from '@/lib/services/db.service';
import { generateNextAdaptiveResponse } from '@/lib/services/ai-engine/interviewer';
import { getOrCreateSessionTelemetry } from '@/lib/services/ai-engine/adaptive-engine.service';

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

    let aiResult;
    try {
      aiResult = await generateNextAdaptiveResponse(sessionId, message.trim());
    } catch (aiErr: any) {
      console.warn('[api/interviews/message] AI generation fallback:', aiErr?.message);
      const currentTelemetry = getOrCreateSessionTelemetry(sessionId, session.type, session.difficulty);
      const defaultText =
        session.type === 'behavioral'
          ? `Thank you for walking me through that situation. Focusing on the measurable outcome: what were the quantifiable metrics or long-term impacts of the decisions you made?`
          : `That's a sound initial approach. Now, looking at optimization: if the concurrent traffic increases by 50x, where would the primary bottleneck emerge in this design, and how would you mitigate it?`;
      
      aiResult = {
        message: defaultText,
        telemetry: currentTelemetry,
        evaluation: {
          score: 75,
          topic: currentTelemetry.currentTopic,
          strengths: ['Initial answer provided'],
          weaknesses: ['Scale and edge cases need exploration'],
          branchDecision: 'PROBE_DEEPER' as const,
          suggestedFocusArea: 'High scale optimization',
          difficultyAdjustment: 0.05,
          feedbackNote: 'Targeting edge cases',
        },
      };
    }

    // Save AI interviewer's reply to Supabase
    await createMessage({
      session_id: sessionId,
      sender_role: 'ai',
      content: aiResult.message,
      sequence_order: nextOrder + 1,
    });

    return NextResponse.json(
      {
        message: aiResult.message,
        telemetry: aiResult.telemetry,
        evaluation: aiResult.evaluation,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[api/interviews/message] Error processing message:', err);
    return NextResponse.json(
      { error: 'Error', message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
