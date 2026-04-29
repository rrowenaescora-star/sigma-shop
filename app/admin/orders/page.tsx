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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

      alert("Order updated successfully");
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Update error");
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
    <div className="min-h-screen bg-[#070b14] p-10 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          Admin Orders
        </h1>
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

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-white/10 bg-[#101729] p-6"
          >
            <div className="flex justify-between gap-6">
              <div>
                <p className="text-lg font-bold">
                  #{order.id}
                </p>

                <p>👤 {order.roblox_username}</p>
                <p>📧 {order.contact_info}</p>

                <p className="font-bold text-cyan-300">
                  ${Number(order.total_price).toFixed(2)}
                </p>

                <p className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm">
                  Payment: {order.payment_status}
                </p>

                <p className="text-sm">
                  Delivery: {order.delivery_status || "Pending"}
                </p>

                <p className="text-sm">
                  Status: {order.status}
                </p>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {/* STATUS */}
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
                <option className="bg-[#0b1220] text-white">
                  Pending
                </option>
                <option className="bg-[#0b1220] text-white">
                  Processing
                </option>
                <option className="bg-[#0b1220] text-white">
                  Completed
                </option>
                <option className="bg-[#0b1220] text-white">
                  Cancelled
                </option>
              </select>

              {/* DELIVERY */}
              <select
                className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                value={order.delivery_status || "Pending"}
                onChange={(e) =>
                  setOrders((prev) =>
                    prev.map((item) =>
                      item.id === order.id
                        ? {
                            ...item,
                            delivery_status: e.target.value,
                          }
                        : item
                    )
                  )
                }
              >
                <option className="bg-[#0b1220] text-white">
                  Pending
                </option>
                <option className="bg-[#0b1220] text-white">
                  Processing
                </option>
                <option className="bg-[#0b1220] text-white">
                  Delivered
                </option>
              </select>

              {/* HANDLED BY */}
              <input
                placeholder="Handled by"
                value={order.handled_by || ""}
                className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                onChange={(e) =>
                  setOrders((prev) =>
                    prev.map((item) =>
                      item.id === order.id
                        ? {
                            ...item,
                            handled_by: e.target.value,
                          }
                        : item
                    )
                  )
                }
              />

              {/* DELIVERY NOTES */}
              <input
                placeholder="Delivery notes"
                value={order.delivery_notes || ""}
                className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none"
                onChange={(e) =>
                  setOrders((prev) =>
                    prev.map((item) =>
                      item.id === order.id
                        ? {
                            ...item,
                            delivery_notes: e.target.value,
                          }
                        : item
                    )
                  )
                }
              />

              {/* SAVE BUTTON */}
              <button
                onClick={() =>
                  updateOrder(order.id, {
                    status: order.status,
                    deliveryStatus: order.delivery_status,
                    deliveryNotes: order.delivery_notes,
                    handledBy: order.handled_by,
                  })
                }
                className="rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400"
              >
                Save Changes
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-gray-400">
            No orders found.
          </p>
        )}
      </div>
    </div>
  );
}