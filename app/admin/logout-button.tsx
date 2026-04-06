"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
    >
      Logout
    </button>
  );
}
