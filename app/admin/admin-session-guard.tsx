"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_SESSION_STARTED_AT = "admin-session-started-at";
const ADMIN_MAX_AGE = 4 * 60 * 60 * 1000;

export default function AdminSessionGuard() {
  useEffect(() => {
    const supabase = createClient();

    async function checkSessionAge() {
      const now = Date.now();
      const startedAt = localStorage.getItem(ADMIN_SESSION_STARTED_AT);

      if (!startedAt) {
        localStorage.setItem(ADMIN_SESSION_STARTED_AT, String(now));
        return;
      }

      const age = now - Number(startedAt);

      if (age > ADMIN_MAX_AGE) {
        localStorage.removeItem(ADMIN_SESSION_STARTED_AT);
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
      }
    }

    checkSessionAge();
  }, []);

  return null;
}