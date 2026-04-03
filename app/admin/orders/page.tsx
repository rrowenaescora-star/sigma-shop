"use client";

import { useEffect, useState } from "react";

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
  paypal_order_id?: string | null;
  payment_status?: string | null;
  payer_email?: string | null;
  paid_at?: string | null;
  delivery_status?: string | null;
  delivery_notes?: string | null;
  delivered_at?: string | null;
  handled_by?: string | null;
  created_at?: string;
};
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading orders...");
  const [inputPassword, setInputPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("real-admin-unlocked");
    if (saved === "true") {
      setIsUnlocked(true);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setMessage("Loading orders...");

      const response = await fetch("/api/admin/orders");
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to load orders.");
        setLoading(false);
        return;
      }

      setOrders(result.orders || []);
      setMessage("Orders loaded.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isUnlocked) {
      loadOrders();
    }
  }, [isUnlocked]);

  function handleUnlock() {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!adminPassword) {
      alert("Admin password is not set in .env.local");
      return;
    }

    if (inputPassword === adminPassword) {
      localStorage.setItem("real-admin-unlocked", "true");
      setIsUnlocked(true);
      setInputPassword("");
    } else {
      alert("Wrong password.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("real-admin-unlocked");
    setIsUnlocked(false);
    setOrders([]);
    setMessage("Logged out.");
  }

  async function markDone(orderId: number) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "Completed",
      }),
    });

    loadOrders();
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Admin Access
          </p>
          <h1 className="mt-3 text-4xl font-extrabold">Enter Password</h1>
          <p className="mt-3 text-slate-400">
            This page is protected. Enter the admin password to continue.
          </p>

          <div className="mt-6">
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={handleUnlock}
            className="mt-4 rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
          >
            Unlock Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Orders Dashboard</h1>
            <p className="mt-2 text-slate-400">
              View all saved checkout orders
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadOrders}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh Orders
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-white/10 px-5 py-3 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          {message}
        </div>

        <div className="mt-8 grid gap-6">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
              Loading...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[2rem] border border-white/10 bg-[#101729] p-6 shadow-xl"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{order.id}</h2>
                    <p className="mt-2 text-slate-300">
                      Roblox Username:{" "}
                      <span className="font-bold text-cyan-300">
                        {order.roblox_username}
                      </span>
                    </p>
		    <p className="mt-1 text-slate-300">
  Payment Status:{" "}
  <span className="font-bold text-cyan-300">
    {order.payment_status || "Unpaid"}
  </span>
</p>

<p className="mt-1 text-slate-300">
  PayPal Order ID:{" "}
  <span className="font-bold">
    {order.paypal_order_id || "N/A"}
  </span>
</p>

<p className="mt-1 text-slate-300">
  Payer Email:{" "}
  <span className="font-bold">
    {order.payer_email || "N/A"}
  </span>
</p>

<p className="mt-1 text-slate-300">
  Paid At:{" "}
  <span className="font-bold">
    {order.paid_at ? new Date(order.paid_at).toLocaleString() : "Not paid"}
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
                    <div className="flex gap-2 items-center">
                      <span className="rounded-full bg-violet-400 px-4 py-2 text-sm font-bold text-slate-950">
                        {order.status}
                      </span>

                      {order.status !== "Completed" && (
                        <button
                          onClick={() => markDone(order.id)}
                          className="rounded-lg bg-green-400 px-3 py-1 font-bold text-black"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>

                    <span className="text-2xl font-extrabold text-cyan-300">
                      ${Number(order.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold">Items</h3>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
