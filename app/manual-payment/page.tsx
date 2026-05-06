"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ManualPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Your order is not completed yet. Make sure you saved your Order ID before leaving.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  function copyOrderId() {
    if (!orderId) return;

    navigator.clipboard.writeText(`Order ID: ${orderId}`);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-[#08111f] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d] p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
          Manual Payment
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Order Placed Successfully
        </h1>

        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-slate-300">Your Order ID</p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="truncate text-2xl font-black text-emerald-300">
              #{orderId || "Not found"}
            </p>

            <button
              type="button"
              onClick={copyOrderId}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-300"
            >
              {copied ? "Copied!" : "Copy ID"}
            </button>
          </div>
        </div>

        <p className="mt-4 leading-6 text-slate-300">
          Online payment gateways are currently under verification. Manual
          payment is temporarily enabled to continue serving customers safely
          while automated checkout is being finalized.
        </p>

        <div className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0b1628] p-5">
          <p className="text-sm font-bold tracking-wide text-blue-300">
            Manual Payment Instructions
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Follow these steps to complete your order safely through our Discord
            delivery team.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
              <p className="font-bold text-white">Step 1 — Copy Your Order ID</p>
              <p className="mt-1 text-sm text-slate-300">
                Save your Order ID. You will need it inside the Discord ticket.
              </p>

              <button
                type="button"
                onClick={copyOrderId}
                className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-400"
              >
                {copied ? "Copied!" : "Copy Order ID"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
              <p className="font-bold text-white">
                Step 2 — Open Discord Ticket
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Click the Discord button and create a ticket for manual payment
                support.
              </p>

              <a
                href="https://discord.gg/evM2G5c9Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-400"
              >
                Open Discord
              </a>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
              <p className="font-bold text-white">
                Step 3 — Verify Order Details
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Our bot and delivery team will verify your Order ID, item,
                username, and final total before payment confirmation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
              <p className="font-bold text-white">Step 4 — Complete Payment</p>
              <p className="mt-1 text-sm text-slate-300">
                Only send payment after our delivery team confirms your order
                details inside the ticket.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="font-bold text-emerald-300">
                Step 5 — Receive Your Digital Item
              </p>
              <p className="mt-1 text-sm text-slate-300">
                After payment confirmation, our delivery team will process and
                complete your order.
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://discord.gg/evM2G5c9Vr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block w-full rounded-2xl bg-indigo-500 py-3 text-center font-bold text-white hover:bg-indigo-400"
        >
          Contact Us on Discord
        </a>

        <Link
          href={`/track-order?orderId=${orderId || ""}`}
          className="mt-3 block w-full rounded-2xl border border-slate-700/60 bg-slate-900/40 py-3 text-center font-bold text-slate-200 hover:bg-slate-800"
        >
          Track My Order
        </Link>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Do not create another order unless support tells you to. Duplicate
          orders may delay fulfillment.
        </p>
      </div>
    </div>
  );
}

export default function ManualPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08111f] px-4 py-10 text-white">
          Loading manual payment page...
        </div>
      }
    >
      <ManualPaymentContent />
    </Suspense>
  );
}