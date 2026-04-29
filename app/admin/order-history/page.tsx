"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  roblox_username: string;
  contact_info: string;
  total_price: number;
  status: string;
  payment_status: string;
  delivery_status: string;
  delivery_notes: string;
  handled_by: string;
  created_at: string;
};

export default function AdminOrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/admin/orders");

        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to fetch order history");
          return;
        }

        const historyOrders = (data.orders || []).filter((order: Order) => {
          const status = (order.status || "").toLowerCase();
          const delivery = (order.delivery_status || "").toLowerCase();

          return (
            status.includes("completed") ||
            status.includes("cancelled") ||
            delivery.includes("delivered")
          );
        });

        setOrders(historyOrders);
      } catch (error) {
        console.error(error);
        alert("Failed to load order history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-10 text-white">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] p-10 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="mt-1 text-sm text-slate-400">
            Completed, delivered, cancelled, and archived orders
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400"
        >
          Back to Active Orders
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-white/10 bg-[#101729] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold">#{order.id}</p>
                <p>👤 {order.roblox_username}</p>
                <p>📧 {order.contact_info}</p>
                <p className="font-bold text-cyan-300">
                  ${Number(order.total_price).toFixed(2)}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right text-sm">
                <p>Status: {order.status}</p>
                <p>Payment: {order.payment_status}</p>
                <p>Delivery: {order.delivery_status || "Pending"}</p>
                <p>Handled By: {order.handled_by || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-sm">
              <p className="font-semibold text-slate-200">Delivery Notes</p>
              <p className="mt-2 text-slate-400">
                {order.delivery_notes || "No delivery notes available."}
              </p>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-slate-400">No archived orders found.</p>
        )}
      </div>
    </div>
  );
}
