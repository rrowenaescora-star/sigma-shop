"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allowedAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      alert("Missing Supabase environment variables.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("SIGNED IN USER:", user);
      console.log("GET USER ERROR:", userError);
      console.log("ALLOWED ADMINS:", allowedAdmins);

      if (userError) {
        alert(userError.message);
        return;
      }

      if (!user) {
        alert("Login succeeded but no user session was found.");
        return;
      }

    if (allowedAdmins.length && !allowedAdmins.includes(user.email ?? "")) {
 alert(`Login success: ${user.email ?? "unknown"}`);
window.location.href = "/admin/products";
return;
}

      window.location.href = "/admin/products";
    } catch (error) {
      console.error(error);
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Login</h1>
        <p className="mt-2 text-slate-400">
          Sign in to access the admin dashboard
        </p>

        {!supabase && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Missing Supabase environment variables. Check Vercel settings.
          </div>
        )}

        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading || !supabase}
          className={`mt-6 w-full rounded-2xl py-3 font-bold ${
            loading || !supabase
              ? "bg-slate-700 text-slate-300"
              : "bg-cyan-400 text-slate-950"
          }`}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
