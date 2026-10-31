"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SupportChat = dynamic(() => import("@/components/SupportChat"), { ssr: false });

export default function LazySupportChat() {
  const [activated, setActivated] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [hasUnreadReply, setHasUnreadReply] = useState(false);

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(({ data }) => setCustomerId(data.user?.id || null));
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setCustomerId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!customerId) { setHasUnreadReply(false); return; }
    let cancelled = false;
    const checkUnread = async () => {
      const response = await fetch("/api/support/conversations", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (cancelled) return;
      const conversations = data.conversations || [];
      const readAt = Number(localStorage.getItem(`bloxhop-support-read-${customerId}`) || 0);
      const newestStaffReply = conversations.flatMap((item: { support_messages?: { sender: string; created_at?: string }[] }) => item.support_messages || [])
        .filter((item: { sender: string }) => item.sender === "staff")
        .reduce((latest: number, item: { created_at?: string }) => Math.max(latest, new Date(item.created_at || 0).getTime()), 0);
      setHasUnreadReply(newestStaffReply > readAt);
    };
    checkUnread().catch(() => undefined);
    const timer = window.setInterval(() => checkUnread().catch(() => undefined), 10000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [customerId]);

  if (activated) return <SupportChat initiallyOpen />;

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className="midnight-support-launcher fixed bottom-4 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-[0_0_28px_rgba(59,130,246,.45)] transition hover:scale-110 sm:bottom-6 sm:right-6"
      aria-label={hasUnreadReply ? "Open support chat: unread reply" : "Open support chat"}
    >
      💬
      {hasUnreadReply && <span aria-label="Unread support reply" className="absolute -right-0.5 -top-0.5 z-10 h-4 w-4 animate-pulse rounded-full border-2 border-[#06101d] bg-red-500" />}
    </button>
  );
}
