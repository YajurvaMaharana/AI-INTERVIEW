import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "@/lib/services/db.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // 1. Delete user from Supabase Auth if admin client is available
    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      try {
        await adminClient.auth.admin.deleteUser(userId);
      } catch (authErr: any) {
        console.warn("[api/user/delete] Supabase admin auth delete notice:", authErr?.message);
      }
    }

    // 2. Cascade delete in database and in-memory cache
    await deleteUser(userId);

    const response = NextResponse.json({
      success: true,
      message: "Account and candidate data permanently deleted.",
    });

    // Clear session cookies
    response.cookies.delete("sb-mock-auth");
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");

    return response;
  } catch (error: any) {
    console.error("[api/user/delete] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return POST(request);
}
