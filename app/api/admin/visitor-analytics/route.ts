import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await adminSupabase.from("visitor_events").select("id,visitor_id,path,customer_email,device,country,created_at").order("created_at", { ascending: false }).limit(1000);
  if (error) return NextResponse.json({ error: "Visitor analytics is not installed yet. Run visitor-analytics.sql in Supabase first." }, { status: 503 });
  const events = data || [];
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const today = events.filter((event) => new Date(event.created_at).getTime() >= since);
  const count = (items: typeof events) => new Set(items.map((event) => event.visitor_id)).size;
  const summarise = (key: "path" | "country" | "device", items = events) => Object.entries(items.reduce<Record<string, number>>((total, event) => { const label = event[key] || "Unknown"; total[label] = (total[label] || 0) + 1; return total; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  return NextResponse.json({
    summary: { visits: events.length, uniqueVisitors: count(events), visitsToday: today.length, visitorsToday: count(today), signedIn: new Set(events.filter((event) => event.customer_email).map((event) => event.customer_email)).size },
    pages: summarise("path"), countries: summarise("country"), devices: summarise("device"), recent: events.slice(0, 40),
  });
}