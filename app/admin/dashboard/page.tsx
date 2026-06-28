"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import AdminHeader from "../admin-header";

type OrderItem = {
  name?: string;
  product_name?: string;
  item_name?: string;
  title?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  total?: number;
};

type Order = {
  id: string;
  total_price: number;
  status: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  payer_email?: string;
  contact_info?: string;
  customer_email?: string;
  email?: string;
  roblox_username?: string;
  username?: string;
  game?: string;
  payment_method?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  product_name?: string;
  item_name?: string;
  quantity?: number;

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
      const res = await fetch("/api/admin/orders", { cache: "no-store" });

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
    if (savedReset) setSalesResetAt(savedReset);
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const created = new Date(order.created_at);

      if (salesResetAt && created < new Date(salesResetAt)) return false;

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

 function getOrderItems(order: Order) {
  const items = order.items || order.order_items || [];

  if (items.length > 0) {
    return items
      .map((item) => {
        return (
          item.name ||
          item.product_name ||
          item.item_name ||
          item.title ||
          "Unknown Item"
        );
      })
      .join(", ");
  }

  return order.product_name || order.item_name || "No item data";
}

function getOrderQuantity(order: Order) {
  const items = order.items || order.order_items || [];

  if (items.length > 0) {
    return items.reduce((total, item) => {
      return total + Number(item.quantity || item.qty || 1);
    }, 0);
  }

  return order.quantity || "";
}

  function exportSalesToExcel() {
    const rows: Record<string, string | number>[] = filteredOrders.map((order) => ({
      "Order ID": order.id,
      Date: new Date(order.created_at).toLocaleString(),
      Customer: order.roblox_username || order.username || "",
      Email:
      order.payer_email ||
      order.customer_email ||
      order.email ||
      order.contact_info ||
      "",
      "Item Name": getOrderItems(order),
      Quantity: getOrderQuantity(order),
      "Payment Method": order.payment_method || "",
      "Total Price": Number(order.total_price || 0),
      Status: order.status || "",
      "Payment Status": order.payment_status || "",
      "Delivery Status": order.delivery_status || "",
    }));

    const summaryRows: Record<string, string | number>[] = [
      { Metric: "Report Type", Value: filter.toUpperCase() },
      { Metric: "Generated At", Value: new Date().toLocaleString() },
      { Metric: "Total Orders", Value: stats.totalOrders },
      { Metric: "Paid Orders", Value: stats.paidOrders },
      { Metric: "Pending Orders", Value: stats.pendingOrders },
      { Metric: "Delivered Orders", Value: stats.deliveredOrders },
      { Metric: "Unpaid Orders", Value: stats.unpaidOrders },
      { Metric: "Refund Orders", Value: stats.refundOrders },
      { Metric: "Gross Sales", Value: stats.grossSales },
      { Metric: "Possible Sales", Value: stats.possibleSales },
      { Metric: "Average Order", Value: stats.averageOrderValue },
      { Metric: "Conversion Rate", Value: `${stats.conversionRate}%` },
    ];

    const ordersSheet = XLSX.utils.json_to_sheet(rows);
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);

    ordersSheet["!cols"] = [
      { wch: 28 },
      { wch: 22 },
      { wch: 20 },
      { wch: 28 },
      { wch: 18 },
      { wch: 45 },
      { wch: 10 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    summarySheet["!cols"] = [{ wch: 24 }, { wch: 24 }];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Dashboard");
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Sigma-Shop-${filter}-Sales-${today}.xlsx`);
  }

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
          onClick={exportSalesToExcel}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 font-bold text-emerald-300 hover:bg-emerald-500/20"
        >
          📊 Export Excel
        </button>

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