import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function requireAdmin() {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  const admins = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  return user && (admins.length === 0 || admins.includes(user.email ?? "")) ? user : null;
}

function normalizeRobloxInvitation(value: unknown) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || (url.hostname !== "roblox.com" && !url.hostname.endsWith(".roblox.com"))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { data, error } = await supabase.from("shop_settings").select("id, global_capital, steal_an_egg_server_url, updated_at").single();
    if (error || !data) return NextResponse.json({ error: "Failed to load shop settings." }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.global_capital !== undefined) {
      const globalCapital = Number(body.global_capital);
      if (!Number.isFinite(globalCapital) || globalCapital < 0) return NextResponse.json({ error: "Invalid global capital value." }, { status: 400 });
      updates.global_capital = globalCapital;
    }
    if (body.steal_an_egg_server_url !== undefined) {
      const url = normalizeRobloxInvitation(body.steal_an_egg_server_url);
      if (url === null) return NextResponse.json({ error: "Use a valid HTTPS roblox.com server invitation link." }, { status: 400 });
      updates.steal_an_egg_server_url = url || null;
    }
    if (Object.keys(updates).length === 1) return NextResponse.json({ error: "No setting was provided." }, { status: 400 });

    const { data: settingsRow, error: loadError } = await supabase.from("shop_settings").select("id").single();
    if (loadError || !settingsRow) return NextResponse.json({ error: "Failed to load shop settings row." }, { status: 500 });
    const { error: updateError } = await supabase.from("shop_settings").update(updates).eq("id", settingsRow.id);
    if (updateError) return NextResponse.json({ error: "Failed to update shop settings." }, { status: 500 });
    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}