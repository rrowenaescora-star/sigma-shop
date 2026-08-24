import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { adminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

type Context = { params: Promise<{ id: string }> };
type SupportMessage = { attachment_path?: string | null; [key: string]: unknown };

async function ownedConversation(id: string, userId: string) {
  const { data } = await adminSupabase.from("support_conversations").select("id, subject").eq("id", id).eq("customer_id", userId).single();
  return data;
}

async function withAttachmentUrls(messages: SupportMessage[]) {
  return Promise.all(messages.map(async (message) => {
    if (!message.attachment_path) return message;
    const { data } = await adminSupabase.storage.from("support-attachments").createSignedUrl(message.attachment_path, 3600);
    return { ...message, attachment_url: data?.signedUrl || null };
  }));
}

export async function GET(_: Request, context: Context) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { id } = await context.params;
  if (!(await ownedConversation(id, user.id))) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const { data, error } = await adminSupabase.from("support_messages").select("id, sender, body, attachment_path, created_at").eq("conversation_id", id).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: await withAttachmentUrls(data || []) });
}

export async function POST(request: Request, context: Context) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { id } = await context.params;
  const conversation = await ownedConversation(id, user.id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const { message, attachmentPath } = await request.json();
  const typedBody = typeof message === "string" ? message.trim() : "";
  const hasAttachment = typeof attachmentPath === "string" && attachmentPath.startsWith(`customers/${user.id}/`);
  const body = typedBody || "Screenshot attached.";

  if ((!typedBody && !hasAttachment) || typedBody.length > 4000) {
    return NextResponse.json({ error: "Enter a message up to 4,000 characters or attach a screenshot." }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("support_messages")
    .insert({ conversation_id: id, sender: "customer", body, attachment_path: hasAttachment ? attachmentPath : null })
    .select("id, sender, body, attachment_path, created_at")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message || "Your message could not be sent." }, { status: 500 });

  await adminSupabase.from("support_conversations").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", id);
  void sendEmail({ to: "support@bloxhop.site", subject: `New Bloxhop support reply: ${conversation.subject}`, html: `<p><strong>${user.email || "A customer"}</strong> sent a follow-up message.</p><p>${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p><p>Reply from the Bloxhop Admin Support inbox.</p>` }).catch(() => undefined);

  return NextResponse.json({ message: (await withAttachmentUrls([data]))[0] });
}