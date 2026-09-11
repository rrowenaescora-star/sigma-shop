"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const SupportChat = dynamic(() => import("@/components/SupportChat"), { ssr: false });

export default function LazySupportChat() {
  const [activated, setActivated] = useState(false);

  if (activated) return <SupportChat initiallyOpen />;

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className="fixed bottom-4 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-[0_0_28px_rgba(59,130,246,.45)] transition hover:scale-110 sm:bottom-6 sm:right-6"
      aria-label="Open support chat"
    >
      💬
    </button>
  );
}
