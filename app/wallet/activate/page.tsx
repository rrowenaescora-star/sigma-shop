"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActivateResponse = {
  success?: boolean;
  redirectTo?: string;
  error?: string;
};

export default function WalletActivatePage() {
  const router = useRouter();


  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const emailFromUrl = params.get("email");

  if (emailFromUrl) {
    setEmail(emailFromUrl.trim().toLowerCase());
  }
}, []);

  async function handleActivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = accessCode.trim().toUpperCase();

    if (!normalizedEmail || !normalizedCode) {
      setError("Email and access code are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          accessCode: normalizedCode,
        }),
      });

      const data = (await response.json()) as ActivateResponse;

      if (!response.ok) {
        setError(data.error || "Unable to activate your wallet.");
        return;
      }

      router.push(data.redirectTo || "/wallet/dashboard");
      router.refresh();
    } catch (activationError) {
      console.error("Wallet activation error:", activationError);
      setError("Unable to connect to the wallet service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <span className="text-lg font-black tracking-tight">B</span>
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Bloxhop Wallet
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
            ✓
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Wallet Approved
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Activate your wallet
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter the approved email and one-time access code connected to your
            wallet.
          </p>

          <form onSubmit={handleActivate} className="mt-7">
            <label
              htmlFor="activation-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <input
              id="activation-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <label
              htmlFor="access-code"
              className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
            >
              Access code
            </label>

            <input
              id="access-code"
              type="text"
              value={accessCode}
              onChange={(event) =>
                setAccessCode(event.target.value.toUpperCase())
              }
              placeholder="BH-123456"
              autoComplete="one-time-code"
              disabled={loading}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-center text-base font-bold uppercase tracking-[0.16em] text-slate-950 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Activating..." : "Activate Wallet"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/wallet")}
            disabled={loading}
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Back to wallet
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          The access code is only required during first-time activation.
        </p>
      </section>
    </main>
  );
}