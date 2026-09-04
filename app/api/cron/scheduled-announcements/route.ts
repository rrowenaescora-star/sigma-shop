import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { renderAnnouncementEmail, type AnnouncementContent } from "@/lib/announcement-email";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: jobs, error } = await adminSupabase.from("scheduled_announcements").select("*").eq("status", "scheduled").lte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(1);
  if (error) return NextResponse.json({ error: "Could not find scheduled announcements." }, { status: 500 });
  const job = jobs?.[0];
  if (!job) return NextResponse.json({ processed: 0 });

  const lock = await adminSupabase.from("scheduled_announcements").update({ status: "sending" }).eq("id", job.id).eq("status", "scheduled").select("id").maybeSingle();
  if (lock.error || !lock.data) return NextResponse.json({ processed: 0 });

  try {
    const content = job.announcement as AnnouncementContent;
    const html = renderAnnouncementEmail(content, process.env.EMAIL_ASSET_BASE_URL || "https://bloxhop.site");
    for (const recipient of job.recipients as string[]) await sendEmail({ to: recipient, subject: content.subject, html });
    await adminSupabase.from("scheduled_announcements").update({ status: "completed", completed_at: new Date().toISOString(), error: null }).eq("id", job.id);
    return NextResponse.json({ processed: (job.recipients as string[]).length });
  } catch (error) {
    await adminSupabase.from("scheduled_announcements").update({ status: "failed", error: error instanceof Error ? error.message.slice(0, 180) : "Email delivery failed." }).eq("id", job.id);
    return NextResponse.json({ error: "Scheduled announcement failed." }, { status: 500 });
  }
}