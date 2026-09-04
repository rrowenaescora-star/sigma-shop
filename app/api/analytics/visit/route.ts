import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase-admin";

const validVisitor = (value: unknown) => typeof value === "string" && /^[a-f0-9-]{20,64}$/i.test(value);
const validPath = (value: unknown) => typeof value === "string" && value.startsWith("/") && value.length <= 180;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!validVisitor(body.visitorId) || !validPath(body.path)) return NextResponse.json({ error: "Invalid visit." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userAgent = request.headers.get("user-agent") || "";
    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "Mobile" : "Desktop";
    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;
    const { error } = await adminSupabase.from("visitor_events").insert({
      visitor_id: body.visitorId,
      path: body.path,
      query: typeof body.query === "string" ? body.query.slice(0, 180) : null,
      customer_id: user?.id || null,
      customer_email: user?.email?.toLowerCase() || null,
      device,
      country,
      user_agent: userAgent.slice(0, 300) || null,
    });
    if (error) return NextResponse.json({ error: "Visitor analytics is not installed yet." }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not record visit." }, { status: 400 });
  }
}