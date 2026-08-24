import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PATCH(request: Request) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to update your profile." }, { status: 401 });
  }

  const body = await request.json();
  const displayName = typeof body.displayName === "string" ? body.displayName.trim().slice(0, 80) : "";
  const robloxUsername = typeof body.robloxUsername === "string" ? body.robloxUsername.trim().slice(0, 50) : "";

  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name: displayName || null,
        roblox_username: robloxUsername || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) {
    console.error("Profile update failed:", error.message);
    return NextResponse.json({ error: "We could not save your profile. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}