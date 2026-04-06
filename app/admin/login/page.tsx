"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLoginPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.replace("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-extrabold">Login</h1>

        <p className="mt-2 text-slate-400">
          Sign in to access the admin dashboard
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-3 font-bold ${
              loading
                ? "bg-slate-700 text-slate-300"
                : "bg-cyan-400 text-slate-950"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
