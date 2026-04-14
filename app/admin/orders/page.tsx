"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

      setOrders(data.orders || []);
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

      fetchOrders(); // refresh
    } catch (error) {
      console.error(error);
      alert("Update error");
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-white bg-[#070b14] min-h-screen">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-[#101729] border border-white/10 p-6 rounded-2xl"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold text-lg">#{order.id}</p>
                <p>👤 {order.roblox_username}</p>
                <p>📧 {order.contact_info}</p>
                <p className="text-cyan-300 font-bold">
                  ${Number(order.total_price).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-right">
                <span className="text-sm">
                  Payment: {order.payment_status}
                </span>
                <span className="text-sm">
                  Delivery: {order.delivery_status || "Pending"}
                </span>
                <span className="text-sm">
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {/* STATUS */}
              <select
                className="bg-white/10 p-2 rounded"
                value={order.status || "Pending"}
                onChange={(e) =>
                  updateOrder(order.id, { status: e.target.value })
                }
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>

              {/* DELIVERY */}
              <select
                className="bg-white/10 p-2 rounded"
                value={order.delivery_status || "Pending"}
                onChange={(e) =>
                  updateOrder(order.id, {
                    deliveryStatus: e.target.value,
                  })
                }
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Delivered</option>
              </select>

              {/* HANDLED BY */}
              <input
                placeholder="Handled by"
                defaultValue={order.handled_by || ""}
                className="bg-white/10 p-2 rounded"
                onBlur={(e) =>
                  updateOrder(order.id, {
                    handledBy: e.target.value,
                  })
                }
              />

              {/* NOTES */}
              <input
                placeholder="Delivery notes"
                defaultValue={order.delivery_notes || ""}
                className="bg-white/10 p-2 rounded"
                onBlur={(e) =>
                  updateOrder(order.id, {
                    deliveryNotes: e.target.value,
                  })
                }
              />
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-gray-400">No orders found.</p>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
