"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletPaymentSuccessPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          router.replace("/");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          ✓
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
          Payment Completed
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Your payment was received
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your wallet credit will be added after PayMongo confirms the payment.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-600">
            Returning to Bloxhop in{" "}
            <span className="font-bold text-slate-950">{seconds}</span>{" "}
            seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Return to Bloxhop
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          Contact Bloxhop support when you are ready to use your wallet
          balance.
        </p>
      </section>
    </main>
  );
}