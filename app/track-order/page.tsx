
"use client";
import { useEffect } from "react";
import { useState } from "react";

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
      handleTrackOrder();
    }, 300);
  }
}, []);

  async function handleTrackOrder() {
    if (!orderId.trim()) {
      setMessage("Please enter an order ID.");
      return;
    }

    try {
      setLoading(true);
      setOrder(null);
      setMessage("Checking your order...");

      const response = await fetch(
        `/api/track-order?orderId=${encodeURIComponent(orderId)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Order not found.");
        setLoading(false);
        return;
      }

      setOrder(result.order);
      setMessage("Order found.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while tracking your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Order Tracking
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">Track Your Order</h1>
          <p className="mt-3 text-slate-400">
            Enter your order ID to check payment and delivery progress.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />

            <button
              onClick={handleTrackOrder}
              className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
            >
              {loading ? "Checking..." : "Track Order"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            {message}
          </div>
        </div>

        {order && (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold">Order #{order.id}</h2>
                <p className="mt-3 text-slate-300">
                  Roblox Username:{" "}
                  <span className="font-bold text-cyan-300">
                    {order.roblox_username}
                  </span>
                </p>
                <p className="mt-1 text-slate-300">
                  Contact: <span className="font-bold">{order.contact_info}</span>
                </p>
                <p className="mt-1 text-slate-300">
                  Notes:{" "}
                  <span className="font-bold">
                    {order.notes?.trim() ? order.notes : "No notes"}
                  </span>
                </p>
                <p className="mt-1 text-slate-300">
                  Created:{" "}
                  <span className="font-bold">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "N/A"}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <span className="rounded-full bg-violet-400 px-4 py-2 text-sm font-bold text-slate-950">
                  Admin Status: {order.status}
                </span>

                <span className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">
                  Payment: {order.payment_status || "Unpaid"}
                </span>

                <span className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
                  Delivery: {order.delivery_status || "Pending"}
                </span>

                <span className="text-2xl font-extrabold text-cyan-300">
                  ${Number(order.total_price).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Handled By</p>
                <p className="mt-2 font-bold">
                  {order.handled_by || "Not assigned yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Delivered At</p>
                <p className="mt-2 font-bold">
                  {order.delivered_at
                    ? new Date(order.delivered_at).toLocaleString()
                    : "Not delivered yet"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Delivery Notes</p>
              <p className="mt-2 font-bold">
                {order.delivery_notes || "No delivery notes yet"}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Items</h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {order.items?.map((item, index) => (
                  <div
                    key={`${order.id}-${item.id}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-lg font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-400">Tag: {item.tag}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Stock: {item.stock}
                    </p>
                    <p className="mt-2 font-bold text-cyan-300">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
