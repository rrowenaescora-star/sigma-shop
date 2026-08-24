import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const cookieStore = await cookies();
  const authClient = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } });
  const { data: { user } } = await authClient.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim()).filter(Boolean);
  return user && (allowed.length === 0 || allowed.includes(user.email || "")) ? user : null;
}

function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

async function withAttachmentUrls(messages: any[]) {
  return Promise.all(messages.map(async (message) => {
    if (!message.attachment_path) return message;
    const { data } = await adminSupabase.storage.from("support-attachments").createSignedUrl(message.attachment_path, 3600);
    return { ...message, attachment_url: data?.signedUrl || null };
  }));
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (conversationId) {
    const { data: conversation, error } = await adminSupabase.from("support_conversations").select("id, customer_id, subject, status, created_at, updated_at, transcript_sent_at").eq("id", conversationId).single();
    if (error || !conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const [{ data: messages }, { data: customer }] = await Promise.all([
      adminSupabase.from("support_messages").select("id, sender, body, attachment_path, created_at").eq("conversation_id", conversationId).order("created_at"),
      adminSupabase.auth.admin.getUserById(conversation.customer_id),
    ]);
    return NextResponse.json({ conversation: { ...conversation, customer: { email: customer.user?.email || "Customer" }, support_messages: await withAttachmentUrls(messages || []) } });
  }
  const { data, error } = await adminSupabase.from("support_conversations").select("id, customer_id, subject, status, created_at, updated_at, transcript_sent_at").order("updated_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const conversations = await Promise.all((data || []).map(async (conversation) => {
    const { data: customer } = await adminSupabase.auth.admin.getUserById(conversation.customer_id);
    return { ...conversation, customer: { email: customer.user?.email || "Customer" } };
  }));
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, message, attachmentPath } = await request.json(); const typedBody = typeof message === "string" ? message.trim() : ""; const body = typedBody || "Guide screenshot attached.";
  if (!conversationId || (!typedBody && !attachmentPath) || typedBody.length > 4000) return NextResponse.json({ error: "Enter a message up to 4,000 characters." }, { status: 400 });
  const { data: conversation, error: conversationError } = await adminSupabase.from("support_conversations").select("customer_id, subject, transcript_sent_at").eq("id", conversationId).single();
  if (conversationError || !conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const { error } = await adminSupabase.from("support_messages").insert({ conversation_id: conversationId, sender: "staff", body, attachment_path: attachmentPath || null, staff_id: admin.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await adminSupabase.from("support_conversations").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", conversationId);
  const { data: customer } = await adminSupabase.auth.admin.getUserById(conversation.customer_id);
  if (customer.user?.email) void sendEmail({ to: customer.user.email, subject: `Bloxhop Support: ${conversation.subject}`, html: `<p>You have a new reply from Bloxhop Support.</p><p>${escapeHtml(body)}</p><p>Log in to Bloxhop to continue the conversation.</p>` }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, action } = await request.json();
  if (!conversationId || !["close", "delete", "email_transcript"].includes(action)) return NextResponse.json({ error: "Invalid chat action." }, { status: 400 });
  const { data: conversation } = await adminSupabase.from("support_conversations").select("customer_id, subject, transcript_sent_at").eq("id", conversationId).single();
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  if (action === "close") {
    const { error } = await adminSupabase.from("support_conversations").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", conversationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "closed" });
  }
  if (action === "delete") {
    const { error } = await adminSupabase.from("support_conversations").delete().eq("id", conversationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: true });
  }
  if (conversation.transcript_sent_at) {
    const elapsed = Date.now() - new Date(conversation.transcript_sent_at).getTime();
    const cooldown = 2 * 60 * 60 * 1000;
    if (elapsed < cooldown) {
      const minutes = Math.ceil((cooldown - elapsed) / 60000);
      return NextResponse.json({ error: `Transcript email is available again in ${minutes} minute${minutes === 1 ? "" : "s"}.` }, { status: 429 });
    }
  }
  const [{ data: customer }, { data: messages }] = await Promise.all([
    adminSupabase.auth.admin.getUserById(conversation.customer_id),
    adminSupabase.from("support_messages").select("sender, body, created_at").eq("conversation_id", conversationId).order("created_at"),
  ]);
  if (!customer.user?.email) return NextResponse.json({ error: "Customer email is unavailable." }, { status: 400 });
  const transcript = (messages || []).map((message) => `<p><strong>${message.sender === "staff" ? "Bloxhop Support" : "You"}</strong> · ${new Date(message.created_at).toLocaleString()}<br/>${escapeHtml(message.body)}</p>`).join("<hr/>");
  await sendEmail({ to: customer.user.email, subject: `Bloxhop Support chat transcript: ${conversation.subject}`, html: `<h2>Bloxhop Support Chat Transcript</h2>${transcript}` });
  await adminSupabase.from("support_conversations").update({ transcript_sent_at: new Date().toISOString() }).eq("id", conversationId);
  return NextResponse.json({ ok: true, transcriptSent: true });
}