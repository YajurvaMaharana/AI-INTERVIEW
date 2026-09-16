import { NextRequest, NextResponse } from 'next/server';
import {
  parseResumeWithGemini,
  uploadResumeToStorage,
} from '@/lib/services/resume-parser.service';
import { updateUser, getUserById, syncUserToDatabase } from '@/lib/services/db.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let userId = '';
    let fileName = 'Resume.pdf';
    let base64Data = '';
    let rawText = '';
    let isPdf = true;
    let fileBuffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      userId = (formData.get('userId') as string) || '';

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      fileName = file.name || 'Resume.pdf';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      base64Data = fileBuffer.toString('base64');
      isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    } else {
      const json = await request.json();
      userId = json.userId || '';
      fileName = json.filename || json.fileName || 'Resume.pdf';
      base64Data = json.base64 || '';
      rawText = json.rawText || '';
      isPdf = json.isPdf !== undefined ? json.isPdf : true;

      if (base64Data) {
        // Strip data URI prefix if present
        const cleanedBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
        fileBuffer = Buffer.from(cleanedBase64, 'base64');
        base64Data = cleanedBase64;
      } else if (rawText) {
        isPdf = false;
        fileBuffer = Buffer.from(rawText, 'utf-8');
      } else {
        return NextResponse.json(
          { error: 'Provide either file, base64, or rawText in request' },
          { status: 400 }
        );
      }
    }

    if (!userId) {
      // Fallback to demo UUID if none provided
      userId = '00000000-0000-0000-0000-000000000001';
    }

    // 1. Upload to Supabase Storage if file buffer is available
    let resumeUrl = `/storage/resumes/${userId}/${fileName}`;
    if (fileBuffer) {
      try {
        resumeUrl = await uploadResumeToStorage(
          userId,
          fileName,
          fileBuffer,
          isPdf ? 'application/pdf' : 'text/plain'
        );
      } catch (uploadErr) {
        console.warn('[api/user/resume/parse] Storage upload fallback:', uploadErr);
      }
    }

    // 2. AI Extraction Engine via Gemini 3.8 Flash
    const parsedData = await parseResumeWithGemini(
      isPdf ? base64Data : rawText,
      isPdf,
      fileName
    );

    // 3. Persist parsed resume and candidate evidence into database
    const timestamp = new Date().toISOString();
    const existingUser = await getUserById(userId);

    // Merge skills extracted from resume with existing user skills if available
    const existingSkills = existingUser?.skills || [];
    const extractedSkills = [
      ...(parsedData.skills?.languages || []),
      ...(parsedData.skills?.frameworks || []),
      ...(parsedData.skills?.databases || []),
      ...(parsedData.skills?.cloud_and_devops || []),
    ];
    const mergedSkills = Array.from(new Set([...existingSkills, ...extractedSkills]));

    const targetRole =
      existingUser?.target_role && existingUser.target_role !== 'Full-Stack Software Engineer'
        ? existingUser.target_role
        : parsedData.headline || 'Full-Stack Software Engineer';

    const updatedUser = await updateUser(userId, {
      resume_url: resumeUrl,
      resume_filename: fileName,
      resume_parsed_at: timestamp,
      resume_data: parsedData,
      target_role: targetRole,
      skills: mergedSkills.length > 0 ? mergedSkills : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Resume parsed and grounded successfully',
      resumeData: parsedData,
      resumeUrl,
      fileName,
      parsedAt: timestamp,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('[api/user/resume/parse] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to parse resume document' },
      { status: 500 }
    );
  }
}
