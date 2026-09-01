import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user?.email) return null;
  return allowed.length > 0 && allowed.includes(user.email.toLowerCase())
    ? user
    : null;
}