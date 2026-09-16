import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/lib/services/db.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const updatedUser = await updateUser(userId, {
      resume_url: null,
      resume_filename: null,
      resume_parsed_at: null,
      resume_data: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Resume removed successfully',
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('[api/user/resume/delete] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to remove resume' },
      { status: 500 }
    );
  }
}
