import { NextResponse } from 'next/server';
import { parseJobDescription } from '@/lib/services/jd-parser.service';
import { createClient } from '@/lib/supabase/server';
import { syncUserToDatabase } from '@/lib/services/db.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let rawText = '';
    let fileBuffer: Buffer | undefined;
    let mimeType: string | undefined;
    let filename: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textParam = formData.get('rawText') as string | null;

      if (textParam) {
        rawText = textParam;
      }

      if (file && file.size > 0) {
        filename = file.name;
        mimeType = file.type;
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);

        // If it's a plain text file, extract text directly
        if (mimeType.includes('text/plain') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          rawText = fileBuffer.toString('utf-8');
        }
      }
    } else {
      const jsonBody = await req.json().catch(() => ({}));
      rawText = jsonBody.rawText || '';
    }

    if (!rawText.trim() && !fileBuffer) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Please provide either job description text or an uploaded document file.' },
        { status: 400 }
      );
    }

    // Process through JD parser
    const parsedData = await parseJobDescription({
      rawText,
      fileBuffer,
      mimeType,
      filename,
    });

    // Optionally save to user's profile if authenticated
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncUserToDatabase({
          id: user.id,
          email: user.email,
          user_metadata: {
            ...user.user_metadata,
            saved_jd_data: parsedData,
          },
        });
      }
    } catch {
      // Non-blocking for session-only JD parsing
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      filename: filename || null,
    });
  } catch (err: any) {
    console.error('[api/interviews/jd/parse] Parsing error:', err);
    return NextResponse.json(
      {
        error: 'Failed to parse Job Description',
        message: err.message || 'An unexpected error occurred during NLP extraction.',
      },
      { status: 500 }
    );
  }
}
