"use client";

import { useEffect, useMemo, useState, memo } from "react";

type Order = {
  id: number;
  roblox_username: string;
  contact_info: string;
  total_price: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
};

type OrderCardProps = {
  order: Order;
};

const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101729] p-4">
      <div className="flex justify-between">
        <div>
          <p className="font-bold">#{order.id}</p>
          <p className="text-sm text-slate-400">
            {order.roblox_username}
          </p>
        </div>

        <div className="text-right">
          <p className="text-cyan-300 font-bold">
            ${Number(order.total_price).toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">
            {order.payment_status}
          </p>
        </div>
      </div>
    </div>
  );
});

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    loadOrders();
  }, [page]);

  async function loadOrders() {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders?page=${page}&limit=${limit}`);
      const data = await res.json();

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = useMemo(() => {
    return orders.length < limit ? page : page + 1;
  }, [orders, page]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6">
      <h1 className="text-3xl font-extrabold mb-6">Orders</h1>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="bg-white/10 px-4 py-2 rounded-xl"
        >
          Prev
        </button>

        <p className="text-slate-400">Page {page}</p>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="bg-white/10 px-4 py-2 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}
