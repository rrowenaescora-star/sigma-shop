"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  children,
}: LegalPageShellProps) {
  const router = useRouter();

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle_at_35%_90%,rgba(168,85,247,0.10),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-6 md:px-8">
        <header className="mb-10 w-full overflow-hidden rounded-[2rem] border border-blue-500/10 bg-[#0b1628]/80 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="relative flex flex-wrap items-center justify-between gap-5 px-6 py-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(14,165,233,0.12),transparent_28%)]" />

            <Link href="/" className="relative flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Bloxhop"
                className="h-12 w-12 object-contain"
              />

              <div>
                <p className="text-xl font-black tracking-tight text-white">
                  BLOXHOP ONLINE STORE
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Legal information and customer policies.
                </p>
              </div>
            </Link>

            <div className="relative flex flex-wrap gap-3">
              <Link
                href="/home"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Back to Store
              </Link>

              <Link
                href="/track-order"
                className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-[0_0_35px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
              >
                Track Order
              </Link>

              <button
                onClick={handleClose}
                className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-white transition hover:bg-red-500"
                aria-label="Close page"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        </header>

        <section className="pb-20">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-400">
              Bloxhop Legal
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              Please review this information carefully before using Bloxhop or
              placing an order.
            </p>
          </div>

          <div className="space-y-6 text-[15px] leading-8 text-slate-300">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}