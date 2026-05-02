"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return orders.filter((order) => {
      if (!query) return true;

      return (
        String(order.id).toLowerCase().includes(query) ||
        (order.roblox_username || "").toLowerCase().includes(query) ||
        (order.contact_info || "").toLowerCase().includes(query) ||
        (order.status || "").toLowerCase().includes(query) ||
        (order.delivery_status || "").toLowerCase().includes(query) ||
        (order.handled_by || "").toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      completed: orders.filter((order) =>
        (order.status || "").toLowerCase().includes("completed")
      ).length,
      delivered: orders.filter((order) =>
        (order.delivery_status || "").toLowerCase().includes("delivered")
      ).length,
      cancelled: orders.filter((order) =>
        (order.status || "").toLowerCase().includes("cancelled")
      ).length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-10 text-white">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="mt-1 text-sm text-slate-400">
              Completed, delivered, cancelled, and archived orders.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400"
          >
            Back to Active Orders
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#101729] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              History Orders
            </p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Completed
            </p>
            <p className="mt-2 text-3xl font-black">{stats.completed}</p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Delivered
            </p>
            <p className="mt-2 text-3xl font-black">{stats.delivered}</p>
          </div>

          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">
              Cancelled
            </p>
            <p className="mt-2 text-3xl font-black">{stats.cancelled}</p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Order ID, Username, Email, Status, Handler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#101729] px-5 py-4 text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-[#101729] p-5 shadow-lg transition hover:border-cyan-400/20"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-bold">#{order.id}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    👤 {order.roblox_username}
                  </p>
                  <p className="text-sm text-slate-300">
                    📧 {order.contact_info}
                  </p>
                  <p className="mt-2 font-bold text-cyan-300">
                    ${Number(order.total_price).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                    Status: {order.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                    Payment: {order.payment_status}
                  </span>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                    Delivery: {order.delivery_status || "Pending"}
                  </span>
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                    Handled: {order.handled_by || "N/A"}
                  </span>
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

          {filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#101729] p-6 text-slate-400">
              No archived orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}