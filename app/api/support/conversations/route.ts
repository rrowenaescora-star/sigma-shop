import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { adminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

type SupportMessage = { attachment_path?: string | null; [key: string]: unknown };

async function withAttachmentUrls(messages: SupportMessage[]) {
  return Promise.all(messages.map(async (message) => {
    if (!message.attachment_path) return message;
    const { data } = await adminSupabase.storage.from("support-attachments").createSignedUrl(message.attachment_path, 3600);
    return { ...message, attachment_url: data?.signedUrl || null };
  }));
}

function validOwnedAttachment(path: unknown, userId: string) {
  return typeof path === "string" && path.startsWith(`customers/${userId}/`);
}

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Please log in to contact support." }, { status: 401 });

  const { data, error } = await adminSupabase
    .from("support_conversations")
    .select("id, subject, status, created_at, updated_at, support_messages(id, sender, body, attachment_path, created_at)")
    .eq("customer_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const conversations = await Promise.all((data || []).map(async (conversation) => ({
    ...conversation,
    support_messages: await withAttachmentUrls(conversation.support_messages || []),
  })));

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Please log in to contact support." }, { status: 401 });

  const { subject, message, attachmentPath } = await request.json();
  const typedBody = typeof message === "string" ? message.trim() : "";
  const hasAttachment = validOwnedAttachment(attachmentPath, user.id);
  const body = typedBody || "Screenshot attached.";
  const title = typeof subject === "string" && subject.trim() ? subject.trim().slice(0, 120) : "Customer support";

  if ((!typedBody && !hasAttachment) || typedBody.length > 4000) {
    return NextResponse.json({ error: "Enter a message up to 4,000 characters or attach a screenshot." }, { status: 400 });
  }

  const { data: conversation, error: conversationError } = await adminSupabase
    .from("support_conversations")
    .insert({ customer_id: user.id, subject: title })
    .select("id, subject, status, created_at, updated_at")
    .single();

  if (conversationError || !conversation) return NextResponse.json({ error: conversationError?.message || "Could not start the conversation." }, { status: 500 });

  const { data: createdMessage, error: messageError } = await adminSupabase
    .from("support_messages")
    .insert({ conversation_id: conversation.id, sender: "customer", body, attachment_path: hasAttachment ? attachmentPath : null })
    .select("id, sender, body, attachment_path, created_at")
    .single();

  if (messageError || !createdMessage) return NextResponse.json({ error: messageError?.message || "Your message could not be sent." }, { status: 500 });

  void sendEmail({ to: "support@bloxhop.site", subject: `New Bloxhop support chat: ${title}`, html: `<p><strong>${user.email || "A customer"}</strong> started a support conversation.</p><p>${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p><p>Reply from the Bloxhop Admin Support inbox.</p>` }).catch(() => undefined);

  return NextResponse.json({ conversation: { ...conversation, support_messages: await withAttachmentUrls([createdMessage]) } });
}