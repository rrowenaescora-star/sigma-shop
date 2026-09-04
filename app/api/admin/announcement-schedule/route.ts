import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

const email = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";
const valid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await adminSupabase.from("orders").select("payer_email,contact_info,status,payment_status,delivery_status");
  if (error) return NextResponse.json({ error: "Could not load customer emails." }, { status: 500 });
  const recipients = [...new Set((data || []).filter((row) => [row.status,row.payment_status,row.delivery_status].some((value) => ["paid","free","complete","delivered"].some((word) => String(value || "").toLowerCase().includes(word)))).map((row) => email(row.payer_email || row.contact_info)).filter(valid))].sort();
  return NextResponse.json({ recipients });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const scheduledAt = new Date(String(body.scheduledAt || ""));
  const recipients = Array.isArray(body.recipients) ? [...new Set(body.recipients.map(email).filter(valid))] : [];
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) return NextResponse.json({ error: "Choose a future date and time." }, { status: 400 });
  if (!recipients.length) return NextResponse.json({ error: "Choose at least one customer email." }, { status: 400 });
  if (!body.announcement || typeof body.announcement !== "object") return NextResponse.json({ error: "Announcement details are missing." }, { status: 400 });
  const { error } = await adminSupabase.from("scheduled_announcements").insert({ announcement: body.announcement, recipients, scheduled_at: scheduledAt.toISOString(), created_by: admin.id });
  if (error) return NextResponse.json({ error: "Run scheduled-announcements.sql in Supabase first." }, { status: 503 });
  return NextResponse.json({ success: true });
}