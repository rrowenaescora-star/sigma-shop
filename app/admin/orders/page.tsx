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

  items?: {
    name: string;
    quantity?: number;
    price?: number;
  }[];
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");

      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to fetch orders");
        return;
      }

      const activeOrders = (data.orders || []).filter((order: Order) => {
        const status = (order.status || "").toLowerCase();
        const delivery = (order.delivery_status || "").toLowerCase();

        return !(
          status.includes("completed") ||
          status.includes("cancelled") ||
          delivery.includes("delivered")
        );
      });

      setOrders(activeOrders);
    } catch (error) {
      console.error(error);
      alert("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return orders.filter((order) => {
      if (!query) return true;

      return (
        String(order.id).toLowerCase().includes(query) ||
        (order.roblox_username || "").toLowerCase().includes(query) ||
        (order.contact_info || "").toLowerCase().includes(query) ||
        (order.status || "").toLowerCase().includes(query) ||
        (order.delivery_status || "").toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter(
        (order) => (order.status || "").toLowerCase() === "pending"
      ).length,
      forRefund: orders.filter((order) =>
        (order.status || "").toLowerCase().includes("refund")
      ).length,
      total: orders.length,
    };
  }, [orders]);

  async function updateOrder(
    id: string,
    updates: {
      status?: string;
      deliveryStatus?: string;
      deliveryNotes?: string;
      handledBy?: string;
    }
  ) {
    try {
      setSavingId(id);
      setMessage("");

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Update failed");
        return;
      }

      setMessage(`Order #${id} saved successfully.`);
      await fetchOrders();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      alert("Update error");
    } finally {
      setSavingId(null);
    }
  }

  async function sendOrderReceivedEmail(order: Order) {
    try {
      setSendingEmailId(order.id);
      setMessage("");

      const res = await fetch("/api/admin/orders/send-received-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send email");
        return;
      }

      setMessage(`Order received email sent for Order #${order.id}.`);

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      alert("Email send error");
    } finally {
      setSendingEmailId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-10 text-white">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Orders</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage pending, and refund orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/order-history"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Order History
            </Link>

            <Link
              href="/admin/products"
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:opacity-90"
            >
              Add Products
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#101729] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Active Orders
            </p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-300">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black">{stats.pending}</p>
          </div>

          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">
              For Refund
            </p>
            <p className="mt-2 text-3xl font-black">{stats.forRefund}</p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
            {message}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Order ID, Username, Email, Status..."
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
				
			<div className="mt-3 space-y-2">
  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
    Purchased Items
  </p>

  {(order as any).items?.map((item: any, index: number) => (
    <div
      key={index}
      className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2"
    >
      <p className="text-sm font-semibold text-white">
        {item.name}
      </p>

      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
        <span>Qty: {item.quantity || 1}</span>

        {item.price && (
          <span>
            ${Number(item.price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  ))}
</div>
			
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                    Payment: {order.payment_status}
                  </span>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                    Delivery: {order.delivery_status || "Pending"}
                  </span>
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                    Status: {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-6">
                <select
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                  value={order.status || "Pending"}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((item) =>
                        item.id === order.id
                          ? { ...item, status: e.target.value }
                          : item
                      )
                    )
                  }
                >
                  <option className="bg-[#0b1220] text-white">Pending</option>
                  <option className="bg-[#0b1220] text-white">Completed</option>
                  <option className="bg-[#0b1220] text-white">Cancelled</option>
                  <option className="bg-[#0b1220] text-white">FOR REFUND</option>
                </select>

                <select
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                  value={order.delivery_status || "Pending"}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((item) =>
                        item.id === order.id
                          ? { ...item, delivery_status: e.target.value }
                          : item
                      )
                    )
                  }
                >
                  <option className="bg-[#0b1220] text-white">Pending</option>
                  <option className="bg-[#0b1220] text-white">Delivered</option>
                </select>

                <input
                  placeholder="Handled by"
                  value={order.handled_by || ""}
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((item) =>
                        item.id === order.id
                          ? { ...item, handled_by: e.target.value }
                          : item
                      )
                    )
                  }
                />

                <input
                  placeholder="Delivery notes"
                  value={order.delivery_notes || ""}
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((item) =>
                        item.id === order.id
                          ? { ...item, delivery_notes: e.target.value }
                          : item
                      )
                    )
                  }
                />

                <button
                  onClick={() =>
                    updateOrder(order.id, {
                      status: order.status,
                      deliveryStatus: order.delivery_status,
                      deliveryNotes: order.delivery_notes,
                      handledBy: order.handled_by,
                    })
                  }
                  disabled={savingId === order.id}
                  className="rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingId === order.id ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => sendOrderReceivedEmail(order)}
                  disabled={sendingEmailId === order.id}
                  className="rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingEmailId === order.id ? "Sending..." : "Send Gmail"}
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#101729] p-6 text-gray-400">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}