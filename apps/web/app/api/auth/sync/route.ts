import { NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/lib/services/db.service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let user = body?.user;

    // If no user supplied in body, check server session
    if (!user || !user.id) {
      const supabase = createClient();
      const {
        data: { user: serverUser },
      } = await supabase.auth.getUser();
      user = serverUser;
    }

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authenticated user to sync.' },
        { status: 401 }
      );
    }

    const syncedUser = await syncUserToDatabase(user, body?.accessToken);

    return NextResponse.json(
      {
        success: true,
        user: syncedUser,
        message: 'User synchronized successfully with database.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.warn('[api/auth/sync] Error during user sync (handled safely):', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Sync encountered a minor issue' },
      { status: 200 } // Return 200 so client won't trigger unhandled errors
    );
  }
}
