"use client";

import { useEffect, useState } from "react";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_otp_email") || "";
    setEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, trustDevice }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Invalid OTP.");
      return;
    }

    window.location.href = "/admin/products";
  }

  async function resendOtp() {
    if (resendCooldown > 0) return;

    if (!email) {
      setMessage("Enter your admin email first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to resend OTP.");
      return;
    }

    setResendCooldown(60);
    setMessage("A new OTP has been sent to support@bloxhop.site.");
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-6">
      <form
        onSubmit={verifyOtp}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Admin Security
        </p>

        <h1 className="mt-2 text-4xl font-extrabold">Verify OTP</h1>

        <p className="mt-2 text-slate-400">
          Enter the 6-digit code sent to support@bloxhop.site.
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
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none"
          required
        />

        <label className="mt-5 flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
          />
          Trust this device for 30 days
        </label>

        {message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-cyan-400 py-3 font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-300"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <button
          type="button"
          onClick={resendOtp}
          disabled={loading || resendCooldown > 0}
          className="mt-3 w-full rounded-2xl border border-cyan-400/30 py-3 font-bold text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Resend OTP"}
        </button>
      </form>
    </div>
  );
}