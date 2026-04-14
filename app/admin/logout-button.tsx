"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LogoutButton() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-2xl bg-red-500 px-5 py-3 font-bold text-white"
    >
      Logout
    </button>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
