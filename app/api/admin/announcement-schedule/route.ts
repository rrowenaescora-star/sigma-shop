import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { renderAnnouncementEmail, type AnnouncementContent } from "@/lib/announcement-email";

const email = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";
const valid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [orders, jobs] = await Promise.all([
    adminSupabase.from("orders").select("payer_email,contact_info,status,payment_status,delivery_status"),
    adminSupabase.from("scheduled_announcements").select("id,scheduled_at,status,created_at,completed_at,error,recipients,announcement").order("created_at", { ascending: false }).limit(12),
  ]);
  if (orders.error || jobs.error) return NextResponse.json({ error: "Could not load recipient and status information." }, { status: 500 });
  const recipients = [...new Set((orders.data || []).filter((row) => [row.status,row.payment_status,row.delivery_status].some((value) => ["paid","free","complete","delivered"].some((word) => String(value || "").toLowerCase().includes(word)))).map((row) => email(row.payer_email || row.contact_info)).filter(valid))].sort();
  return NextResponse.json({ recipients, jobs: jobs.data || [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const recipients: string[] = Array.isArray(body.recipients) ? ([...new Set(body.recipients.map((value: unknown) => email(value)).filter(valid))] as string[]) : [];
  if (!recipients.length) return NextResponse.json({ error: "Choose at least one recipient." }, { status: 400 });
  if (!body.announcement || typeof body.announcement !== "object") return NextResponse.json({ error: "Announcement details are missing." }, { status: 400 });

  if (body.sendNow) {
    const created = await adminSupabase.from("scheduled_announcements").insert({ announcement: body.announcement, recipients, scheduled_at: new Date().toISOString(), status: "sending", created_by: admin.id }).select("id").single();
    if (created.error || !created.data) return NextResponse.json({ error: "Could not create send record. Run scheduled-announcements.sql first." }, { status: 503 });
    try {
      const content = body.announcement as AnnouncementContent;
      const html = renderAnnouncementEmail(content, process.env.EMAIL_ASSET_BASE_URL || "https://bloxhop.site");
      for (const recipient of recipients) await sendEmail({ to: recipient, subject: content.subject, html });
      await adminSupabase.from("scheduled_announcements").update({ status: "completed", completed_at: new Date().toISOString(), error: null }).eq("id", created.data.id);
      return NextResponse.json({ success: true, sent: recipients.length });
    } catch (error) {
      await adminSupabase.from("scheduled_announcements").update({ status: "failed", error: error instanceof Error ? error.message.slice(0, 180) : "Email delivery failed." }).eq("id", created.data.id);
      return NextResponse.json({ error: "Could not send the announcement." }, { status: 500 });
    }
  }

  const raw = String(body.scheduledAt || "");
  const scheduledAt = new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(raw) ? raw : raw + "+08:00");
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) return NextResponse.json({ error: "Choose a future date and time." }, { status: 400 });
  const { error } = await adminSupabase.from("scheduled_announcements").insert({ announcement: body.announcement, recipients, scheduled_at: scheduledAt.toISOString(), created_by: admin.id });
  if (error) return NextResponse.json({ error: "Run scheduled-announcements.sql in Supabase first." }, { status: 503 });
  return NextResponse.json({ success: true });
}