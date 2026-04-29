"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  total_price: number;
  status: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders");

        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load dashboard stats");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
        alert("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  const stats = useMemo(() => {
    const now = new Date();

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;

    for (const order of orders) {
      const amount = Number(order.total_price || 0);
      const created = new Date(order.created_at);
      const status = (order.status || "").toLowerCase();
      const delivery = (order.delivery_status || "").toLowerCase();

      totalRevenue += amount;

      const sameDay =
        created.getDate() === now.getDate() &&
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear();

      const sameMonth =
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear();

      if (sameDay) todayRevenue += amount;
      if (sameMonth) monthRevenue += amount;

      if (status.includes("pending") || status.includes("processing")) {
        pendingOrders += 1;
      }

      if (delivery.includes("delivered") || status.includes("completed")) {
        deliveredOrders += 1;
      }
    }

    return {
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      todayRevenue,
      monthRevenue,
    };
  }, [orders]);

  if (loading) {
    return <div className="min-h-screen bg-[#070b14] p-10 text-white">Loading dashboard...</div>;
  }

  const cards = [
    ["Total Orders", stats.totalOrders],
    ["Pending Orders", stats.pendingOrders],
    ["Delivered Orders", stats.deliveredOrders],
    ["Revenue Today", `$${stats.todayRevenue.toFixed(2)}`],
    ["Revenue This Month", `$${stats.monthRevenue.toFixed(2)}`],
    ["Total Revenue", `$${stats.totalRevenue.toFixed(2)}`],
  ];

  return (
    <div className="min-h-screen bg-[#070b14] p-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Revenue, orders, and fulfillment overview
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400"
          >
            Active Orders
          </Link>

          <Link
            href="/admin/order-history"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Order History
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value]) => (
          <div
            key={String(title)}
            className="rounded-3xl border border-white/10 bg-[#101729] p-6"
          >
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
