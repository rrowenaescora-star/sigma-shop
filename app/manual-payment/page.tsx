"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ManualPaymentPageContent()  {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [copied, setCopied] = useState(false);

  async function copyOrderId() {
    if (!orderId) return;
    await navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_34%)]" />

      <div
        className="pointer-events-none absolute right-[-180px] top-[120px] h-[700px] w-[700px] bg-contain bg-center bg-no-repeat opacity-[0.04]"
        style={{ backgroundImage: "url('/bloxlogo2.png')" }}
      />

      <div className="relative">
        <header className="relative mb-7 overflow-hidden border-b border-blue-500/20 px-6 py-7 lg:px-10">
          <div
            className="pointer-events-none absolute inset-0  opacity-20"
            style={{ backgroundImage: "url('/header-email.png')" }}
          />

          <div className="pointer-events-none absolute inset-0 bg-[#06101d]/75" />

          <div className="relative flex w-full flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight text-white">
                BLOXHOP
              </p>
              <p className="text-sm text-slate-400">
                Manual payment checkout
              </p>
            </div>

            <Link
              href="/home"
              className="rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800/70"
            >
              Back to Store
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
          <section className="rounded-[1.75rem] border border-blue-500/20 bg-slate-950/60 p-5 shadow-[0_0_35px_rgba(59,130,246,0.08)] backdrop-blur sm:p-7">
            <div className="border-b border-blue-500/20 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Manual Payment
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Complete your order through Discord
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Your order has been created. Copy your Order ID, check the
                available payment methods, then open a Discord ticket so our bot
                and staff can guide you.
              </p>
            </div>

            <div className="mt-7 grid gap-5">
              <div className="rounded-2xl border border-blue-500/20 bg-[#081426] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                  Step 1
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Copy your Order ID
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Paste this Order ID inside your Discord ticket. Our bot will
                  use it to find your order.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1 rounded-2xl border border-blue-400/20 bg-[#06101d] px-4 py-4">
                    <p className="break-all font-mono text-sm font-bold text-white">
                      {orderId || "No Order ID found"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyOrderId}
                    disabled={!orderId}
                    className={`rounded-2xl px-6 py-4 text-sm font-black transition ${
                      !orderId
                        ? "cursor-not-allowed bg-slate-700 text-slate-300"
                        : "bg-blue-500 text-white hover:bg-blue-400"
                    }`}
                  >
                    {copied ? "Copied" : "Copy Order ID"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-[#081426] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Step 2
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Available payment methods
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  These are the manual payment methods we can currently receive.
                  The exact payment details will be given inside your Discord
                  ticket.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["PayPal", "International payment"],
                    ["Wise", "International transfer"],
                    ["Remittance", "PH receiving option"],
                  ].map(([name, desc]) => (
                    <div
                      key={name}
                      className="rounded-2xl border border-blue-500/20 bg-[#0b1728] p-5"
                    >
                      <p className="text-lg font-black text-white">{name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Step 3
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Open a Discord ticket
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Join our Discord server, go to the ticket channel, create a
                  ticket, then paste your Order ID. Our bot will guide you
                  through the payment process and notify staff for verification.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Once your payment is verified, our staff will deliver your
                  item.
                </p>

                <a
                  href="https://discord.gg/evM2G5c9Vr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full justify-center rounded-2xl bg-[#5865F2] px-5 py-4 text-sm font-black text-white hover:bg-[#4752c4] sm:w-auto"
                >
                  Proceed to Discord Ticket
                </a>
              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                <p className="text-sm font-semibold leading-6 text-yellow-100">
                  Do not send payment before opening a ticket. Always paste your
                  Order ID so our bot can verify your order correctly.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-blue-500/20 pt-6 sm:flex-row">
              <Link
                href={
                  orderId ? `/track-order?orderId=${orderId}` : "/track-order"
                }
                className="rounded-2xl border border-blue-500/20 bg-[#0b1728] px-5 py-3 text-center text-sm font-black text-white hover:bg-[#10233c]"
              >
                Track Order
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-blue-500/20 bg-[#0b1728] px-5 py-3 text-center text-sm font-black text-white hover:bg-[#10233c]"
              >
                Contact Support
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
export default function ManualPaymentPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#06101d] text-white" />}
    >
      <ManualPaymentPageContent />
    </Suspense>
  );
}