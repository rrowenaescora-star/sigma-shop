"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PREFERENCES = "bloxhop-cookie-preferences";
const VISITOR_ID = "bloxhop-visitor-id";

export default function VisitorAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    try {
      const saved = window.localStorage.getItem(PREFERENCES);
      const preferences = saved ? JSON.parse(saved) : null;
      if (!preferences?.analytics) return;
      let visitorId = window.localStorage.getItem(VISITOR_ID);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        window.localStorage.setItem(VISITOR_ID, visitorId);
      }
      void fetch("/api/analytics/visit", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, path: pathname }),
      });
    } catch {
      // Analytics is optional; never interrupt the store if it is unavailable.
    }
  }, [pathname]);

  return null;
}