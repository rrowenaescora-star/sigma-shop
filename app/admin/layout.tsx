import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAILS) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="border-b border-white/10 bg-[#0a1020] px-6 py-4 text-white flex items-center justify-between">
        <div className="font-bold">Admin Panel</div>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
