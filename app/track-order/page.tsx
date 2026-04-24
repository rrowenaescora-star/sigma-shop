"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  tag: string;
  stock: string;
};

type Order = {
  id: number;
  roblox_username: string;
  contact_info: string;
  notes: string | null;
  items: OrderItem[];
  total_price: number;
  status: string;
  payment_status?: string | null;
  payer_email?: string | null;
  delivery_status?: string | null;
  delivery_notes?: string | null;
  delivered_at?: string | null;
  handled_by?: string | null;
  created_at?: string;
};

function statusTone(value?: string | null) {
  const status = (value || "").toLowerCase();

  if (status.includes("paid") || status.includes("complete") || status.includes("delivered")) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  if (status.includes("pending") || status.includes("processing")) {
    return "border-blue-400/25 bg-blue-400/10 text-blue-200";
  }

  if (status.includes("failed") || status.includes("cancel") || status.includes("unpaid")) {
    return "border-red-400/25 bg-red-400/10 text-red-200";
  }

  return "border-slate-500/25 bg-slate-500/10 text-slate-200";
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("Enter your order ID to track it.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");

    if (id) {
      setOrderId(id);
      setTimeout(() => {
        handleTrackOrder(id);
      }, 300);
    }
  }, []);

  async function handleTrackOrder(forcedOrderId?: string) {
    const lookupId = forcedOrderId || orderId;

    if (!lookupId.trim()) {
      setMessage("Please enter an order ID.");
      return;
    }

    try {
      setLoading(true);
      setOrder(null);
      setMessage("Checking your order status...");

      const response = await fetch(
        `/api/track-order?orderId=${encodeURIComponent(lookupId)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Order not found.");
        setLoading(false);
        return;
      }

      setOrder(result.order);
      setMessage("Order found. Review the latest payment and fulfillment status below.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while tracking your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_35%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/10 bg-[#0b1728]/90 px-5 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div>
            <p className="text-2xl font-black tracking-tight">BLOXHOP</p>
            <p className="text-sm text-slate-400">Digital Products & Online Services</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              Back to Store
            </Link>
            <a
    href="mailto:support@bloxhop.site"
    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
  >
    Email Support
  </a>

  <a
    href="https://discord.gg/evM2G5c9Vr"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
  >
    Join Discord
  </a>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1728]/92 shadow-[0_18px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                Order Tracking Portal
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                Track your digital order
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Enter your order ID to review payment status, fulfillment progress,
                support handling, and delivery notes for your digital product or online service.
              </p>
<div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-100">
  <p className="font-semibold text-blue-300">Check your email</p>
  <p className="mt-1 text-slate-300">
    After placing an order, we send a receipt and tracking details to the email
    address you entered during checkout. Please check your inbox, spam, or promotions
    folder if you cannot find it.
  </p>
</div>

              <div className="mt-7 flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter order ID"
                  className="w-full rounded-2xl border border-white/10 bg-[#08111f] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-400/10"
                />

                <button
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                  className={`rounded-2xl px-6 py-3 font-bold transition ${
                    loading
                      ? "cursor-not-allowed bg-slate-700 text-slate-300"
                      : "bg-blue-400 text-slate-950 hover:bg-blue-300"
                  }`}
                >
                  {loading ? "Checking..." : "Track Order"}
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
                {message}
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#08111f]/80 p-6 md:p-8 lg:border-l lg:border-t-0">
              <p className="text-sm font-bold text-white">Support & Fulfillment</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-blue-200">Digital fulfillment</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Orders are fulfilled through digital delivery, online coordination,
                    or service access after payment confirmation.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-emerald-200">Support availability</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Support is available daily from 9:00 AM to 11:00 PM PHT.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-slate-100">Need help?</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Contact support@bloxhop.site with your order ID for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {order && (
          <section className="mt-8 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1728]/92 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                    Order Summary
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    Order #{order.id}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    This page shows the latest information available for your order,
                    including payment status, fulfillment status, and support notes.
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-200">
                    Total Paid
                  </p>
                  <p className="mt-2 text-3xl font-black text-blue-200">
                    ${Number(order.total_price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${statusTone(order.status)}`}>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-80">Order Status</p>
                  <p className="mt-2 font-bold">{order.status || "Pending"}</p>
                </div>

                <div className={`rounded-2xl border p-4 ${statusTone(order.payment_status || "Unpaid")}`}>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-80">Payment</p>
                  <p className="mt-2 font-bold">{order.payment_status || "Unpaid"}</p>
                </div>

                <div className={`rounded-2xl border p-4 ${statusTone(order.delivery_status || "Pending")}`}>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-80">Fulfillment</p>
                  <p className="mt-2 font-bold">{order.delivery_status || "Pending"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-[#0b1728]/92 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold">Customer Information</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Account / Service Username</p>
                    <p className="mt-1 font-bold text-blue-200">{order.roblox_username}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Contact</p>
                    <p className="mt-1 font-bold text-white">{order.contact_info}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Customer Notes</p>
                    <p className="mt-1 font-bold text-white">
                      {order.notes?.trim() ? order.notes : "No notes provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#0b1728]/92 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold">Fulfillment Details</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Created</p>
                    <p className="mt-1 font-bold text-white">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Handled By</p>
                    <p className="mt-1 font-bold text-white">
                      {order.handled_by || "Not assigned yet"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-slate-400">Delivered At</p>
                    <p className="mt-1 font-bold text-white">
                      {order.delivered_at
                        ? new Date(order.delivered_at).toLocaleString()
                        : "Not delivered yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0b1728]/92 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-bold">Fulfillment Notes</h3>
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-200">
                {order.delivery_notes || "No fulfillment notes yet."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0b1728]/92 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                    Order Items
                  </p>
                  <h3 className="mt-2 text-2xl font-black">Products & Services</h3>
                </div>
                <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                  {order.items?.length || 0} item(s)
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {order.items?.map((item, index) => (
                  <div
                    key={`${order.id}-${item.id}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-lg font-bold text-white">{item.name}</p>
                    <p className="mt-2 text-sm text-slate-400">Type: {item.tag || "Digital Service"}</p>
                    <p className="mt-1 text-sm text-slate-400">Status: {item.stock}</p>
                    <p className="mt-4 text-xl font-black text-blue-200">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
