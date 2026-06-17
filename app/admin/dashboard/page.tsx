"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../admin-header";

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
  const [filter, setFilter] = useState<"today" | "month" | "all">("month");
  const [salesResetAt, setSalesResetAt] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

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

  useEffect(() => {
    fetchOrders();

    const savedReset = localStorage.getItem("admin-sales-reset-at");
    if (savedReset) {
      setSalesResetAt(savedReset);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const created = new Date(order.created_at);

      if (salesResetAt && created < new Date(salesResetAt)) {
        return false;
      }

      if (filter === "today") {
        return (
          created.getDate() === now.getDate() &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "month") {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [orders, filter, salesResetAt]);

  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter(
      (order) => (order.payment_status || "").toLowerCase() === "paid"
    );

    const unpaidOrders = filteredOrders.filter(
      (order) => (order.payment_status || "").toLowerCase() !== "paid"
    );

    const deliveredOrders = filteredOrders.filter((order) => {
      const status = (order.status || "").toLowerCase();
      const delivery = (order.delivery_status || "").toLowerCase();

      return delivery.includes("delivered") || status.includes("completed");
    });

    const pendingOrders = filteredOrders.filter((order) => {
      const status = (order.status || "").toLowerCase();
      const delivery = (order.delivery_status || "").toLowerCase();

      return status.includes("pending") || delivery.includes("pending") || !delivery;
    });

    const refundOrders = filteredOrders.filter((order) =>
      (order.status || "").toLowerCase().includes("refund")
    );

    const grossSales = paidOrders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0
    );

    const possibleSales = unpaidOrders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0
    );

    const averageOrderValue =
      paidOrders.length > 0 ? grossSales / paidOrders.length : 0;

    const conversionRate =
      filteredOrders.length > 0
        ? Math.round((paidOrders.length / filteredOrders.length) * 100)
        : 0;

    return {
      totalOrders: filteredOrders.length,
      paidOrders: paidOrders.length,
      unpaidOrders: unpaidOrders.length,
      deliveredOrders: deliveredOrders.length,
      pendingOrders: pendingOrders.length,
      refundOrders: refundOrders.length,
      grossSales,
      possibleSales,
      averageOrderValue,
      conversionRate,
    };
  }, [filteredOrders]);

  function resetSalesCounter() {
    const confirmed = window.confirm(
      "Reset dashboard sales counter from now? This will not delete orders. It only hides older sales from this dashboard."
    );

    if (!confirmed) return;

    const now = new Date().toISOString();
    localStorage.setItem("admin-sales-reset-at", now);
    setSalesResetAt(now);
  }

  function showAllSalesAgain() {
    localStorage.removeItem("admin-sales-reset-at");
    setSalesResetAt(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-10 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] p-10 text-white">
      <AdminHeader
        title="Business Dashboard"
        subtitle="Real sales, orders, fulfillment, and business overview."
        active="dashboard"
        onRefresh={fetchOrders}
      />

      <div className="mb-8 flex flex-wrap gap-3">
        {(["today", "month", "all"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-2xl px-5 py-3 font-bold transition ${
              filter === item
                ? "bg-cyan-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {item === "today"
              ? "Today"
              : item === "month"
                ? "This Month"
                : "All Time"}
          </button>
        ))}

        <button
          onClick={() => setFilter("month")}
          className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-300 hover:bg-yellow-500/20"
        >
          Clear Filter
        </button>

        <button
          onClick={resetSalesCounter}
          className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 hover:bg-red-500/20"
        >
          Reset Sales Counter
        </button>

        {salesResetAt && (
          <button
            onClick={showAllSalesAgain}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 font-bold text-emerald-300 hover:bg-emerald-500/20"
          >
            Show All Sales Again
          </button>
        )}
      </div>

      {salesResetAt && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          Sales counter was reset on{" "}
          <b>{new Date(salesResetAt).toLocaleString()}</b>. Older orders are
          hidden from this dashboard only.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Real Paid Sales" value={`$${stats.grossSales.toFixed(2)}`} highlight />
        <StatCard title="Paid Orders" value={stats.paidOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
        <StatCard title="Delivered Orders" value={stats.deliveredOrders} />
        <StatCard title="Average Order" value={`$${stats.averageOrderValue.toFixed(2)}`} />
        <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} />
        <StatCard title="Unpaid Orders" value={stats.unpaidOrders} />
        <StatCard title="Possible Sales" value={`$${stats.possibleSales.toFixed(2)}`} />
        <StatCard title="Refund Orders" value={stats.refundOrders} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#101729] p-6">
        <h2 className="text-2xl font-black">Dashboard Notes</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Real Paid Sales only counts orders with payment status marked as Paid.
          Possible Sales counts unpaid or pending orders. Reset Sales Counter
          does not delete orders. It only hides old orders from this dashboard
          view so you can start tracking clean sales from now.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlight
          ? "border-cyan-400/30 bg-cyan-400/10"
          : "border-white/10 bg-[#101729]"
      }`}
    >
      <p className="text-sm text-slate-400">{title}</p>
      <p
        className={`mt-3 text-3xl font-black ${
          highlight ? "text-cyan-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}