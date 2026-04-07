"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      alert("Missing Supabase environment variables.");
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        alert(error.message);
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
          disabled={loading}
          className={`mt-6 w-full rounded-2xl py-3 font-bold ${
            loading
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
