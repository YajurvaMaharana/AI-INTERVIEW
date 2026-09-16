import { NextResponse } from 'next/server';
import { createSession, createMessage, syncUserToDatabase } from '@/lib/services/db.service';
import { generateOpeningQuestion } from '@/lib/services/ai-engine/interviewer';
import { createClient } from '@/lib/supabase/server';
import type { InterviewType, Difficulty } from '@/lib/types/database.types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, role, difficulty, jdData, jdRawText } = body;

    const missing: string[] = [];
    if (!type) missing.push('type');
    if (!role || typeof role !== 'string' || role.trim().length === 0) missing.push('role');
    if (!difficulty) missing.push('difficulty');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Missing required fields: ${missing.join(', ')}.` },
        { status: 400 }
      );
    }

    // Normalize interview type to database schema
    const normalizedType: InterviewType =
      type.toLowerCase() === 'hr' || type.toLowerCase() === 'behavioral'
        ? 'behavioral'
        : 'technical';
    const normalizedDifficulty: Difficulty =
      difficulty.toLowerCase() as Difficulty;

    // Retrieve authenticated user if available
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    if (user) {
      await syncUserToDatabase(user);
    }

    // Create session in Supabase (with automatic fallback to in-memory store)
    const session = await createSession({
      user_id: userId,
      type: normalizedType,
      role: role.trim(),
      difficulty: normalizedDifficulty,
      status: 'in_progress',
      jd_data: jdData || null,
      jd_raw_text: jdRawText || null,
    });

    // Generate opening question using Gemini AI engine (with fallback if offline)
    let openingQuestion = '';
    try {
      openingQuestion = await generateOpeningQuestion(
        normalizedType,
        role.trim(),
        normalizedDifficulty,
        session.id,
        jdData || null
      );
    } catch (aiErr: any) {
      console.warn('[api/interviews] AI generation notice:', aiErr?.message);
      if (jdData && jdData.required_skills?.length > 0) {
        if (normalizedType === 'behavioral') {
          openingQuestion = `Welcome! I'm your AI interviewer for the ${role.trim()} position${jdData.company_name ? ` at ${jdData.company_name}` : ''}. Based on our requirements around ${jdData.required_skills.slice(0, 2).join(' and ')}, could you walk me through a complex challenge you led involving these technologies? What was your specific contribution and what was the quantifiable impact?`;
        } else {
          openingQuestion = `Hello and welcome to your targeted technical interview for the ${role.trim()} position. We are specifically looking for deep expertise in ${jdData.required_skills.slice(0, 3).join(', ')}. To start, could you explain how you design resilient services using these technologies under high concurrency, and what trade-offs you prioritize?`;
        }
      } else if (normalizedType === 'behavioral') {
        openingQuestion = `Welcome! I'm your AI interviewer for the ${role.trim()} position. Let's get started. Could you walk me through a recent project where you had to collaborate closely across teams under a tight deadline? What was your specific contribution and what was the outcome?`;
      } else {
        openingQuestion = `Hello and welcome to your technical interview for the ${role.trim()} role. Let's start with your foundational knowledge. In your experience with modern software architecture, how do you approach performance optimization and diagnosing bottlenecks in high-throughput applications?`;
      }
    }

    // Persist opening message to Supabase
    await createMessage({
      session_id: session.id,
      sender_role: 'ai',
      content: openingQuestion,
      sequence_order: 1,
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        message: openingQuestion,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[api/interviews] Error creating interview:', err);
    const status =
      err.name === 'AITimeoutError'
        ? 504
        : err.name === 'AIServiceError'
        ? 502
        : 500;
    return NextResponse.json(
      { error: 'Error', message: err.message || 'Internal Server Error' },
      { status }
    );
  }
}
