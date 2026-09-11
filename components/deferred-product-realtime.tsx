"use client";

import { useEffect, useRef } from "react";

export default function DeferredProductRealtime({ onChange }: { onChange: () => void }) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const connect = async () => {
      if (cancelled || document.visibilityState !== "visible") return;
      const { createClient } = await import("@/lib/supabase/client");
      if (cancelled) return;
      const supabase = createClient();
      const channel = supabase.channel("products-realtime").on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => onChangeRef.current()).subscribe();
      cleanup = () => { void supabase.removeChannel(channel); };
    };

    const start = () => {
      if ("requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(() => { void connect(); }, { timeout: 2500 });
        cleanup = () => window.cancelIdleCallback(idleId);
      } else {
        const timer = globalThis.setTimeout(() => { void connect(); }, 1500);
        cleanup = () => globalThis.clearTimeout(timer);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cleanup) start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cleanup?.();
    };
  }, []);

  return null;
}
