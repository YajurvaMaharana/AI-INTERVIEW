// ---------------------------------------------------------------------------
// /api/grounding/claims-audit/route.ts — Resume Claims Audit API Endpoint
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { auditResumeClaims, generateDeterministicClaimsAudit } from '@/lib/services/claims-audit.service';
import { getUserById } from '@/lib/services/db.service';
import type { ResumeParsedData, JobDescriptionParsedData } from '@/lib/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { resumeData, jdData, userId } = body as {
      resumeData?: ResumeParsedData | null;
      jdData?: JobDescriptionParsedData | null;
      userId?: string;
    };

    if ((!resumeData || !jdData) && userId) {
      const user = await getUserById(userId);
      if (user) {
        if (!resumeData && user.resume_data) {
          resumeData = user.resume_data;
        }
        if (!jdData && user.saved_jd_data) {
          jdData = user.saved_jd_data;
        }
      }
    }

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required to perform claims audit' },
        { status: 400 }
      );
    }

    const auditResult = await auditResumeClaims(resumeData, jdData);

    return NextResponse.json({
      success: true,
      audit: auditResult,
    });
  } catch (err: any) {
    console.error('[ClaimsAuditRoute] Error executing claims audit:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to perform claims audit' },
      { status: 500 }
    );
  }
}
