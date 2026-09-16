import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, syncUserToDatabase } from "@/lib/services/db.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const user = await getUserById(userId);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[api/user/profile] GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      display_name,
      bio,
      target_role,
      avatar_url,
      email,
      skills,
      experience_level,
      preferred_interview_type,
      preferred_language,
      interview_goals,
      target_companies,
      resume_url,
      resume_filename,
      resume_parsed_at,
      resume_data,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required user id" }, { status: 400 });
    }

    const updatedUser = await syncUserToDatabase({
      id,
      email: email || "candidate@example.com",
      display_name,
      avatar_url,
      bio,
      target_role,
      skills,
      experience_level,
      preferred_interview_type,
      preferred_language,
      interview_goals,
      target_companies,
      resume_url,
      resume_filename,
      resume_parsed_at,
      resume_data,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("[api/user/profile] POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      display_name,
      bio,
      target_role,
      avatar_url,
      skills,
      experience_level,
      preferred_interview_type,
      preferred_language,
      interview_goals,
      target_companies,
      resume_url,
      resume_filename,
      resume_parsed_at,
      resume_data,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required user id" }, { status: 400 });
    }

    const updatedUser = await updateUser(id, {
      display_name,
      bio,
      target_role,
      avatar_url,
      skills,
      experience_level,
      preferred_interview_type,
      preferred_language,
      interview_goals,
      target_companies,
      resume_url,
      resume_filename,
      resume_parsed_at,
      resume_data,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("[api/user/profile] PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
