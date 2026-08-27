"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { display_name: string | null };
type Order = { id: number; items: Array<{ name?: string; quantity?: number }> | null; total_price: number; payment_status: string | null; status: string | null; created_at: string; payment_method: string | null; xendit_reference_id?: string | null };

function orderName(order: Order) {
  const first = Array.isArray(order.items) ? order.items[0] : undefined;
  if (!first?.name) return "Digital order";
  const extra = Math.max((order.items?.length || 1) - 1, 0);
  return extra ? `${first.name} +${extra} more` : first.name;
}

export default function CustomerAccount({ ordersOnly = false }: { ordersOnly?: boolean }) {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>({ display_name: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      const [profileResponse, ordersResponse] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        fetch("/api/account/orders", { cache: "no-store" }),
      ]);
      if (profileResponse.data) setProfile({ display_name: profileResponse.data.display_name });
      if (ordersResponse.ok) {
        const result = await ordersResponse.json();
        setOrders(result.orders || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: profile.display_name }),
    });
    setSaving(false);
    setNotice(response.ok ? "Your account details were saved." : "We could not save your account details. Please try again.");
  }

  if (loading) return <main className="min-h-[calc(100vh-82px)] bg-[#06101d] px-4 py-16 text-center text-slate-300">Loading your account…</main>;

  return (
    <main className="min-h-[calc(100vh-82px)] bg-[#06101d] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Customer account</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-black sm:text-4xl">{ordersOnly ? "My Orders" : `Welcome back${profile.display_name ? `, ${profile.display_name}` : ""}`}</h1><p className="mt-2 text-sm text-slate-300">{ordersOnly ? "Orders made while signed in appear here." : email}</p></div>
          
        </div>

        {!ordersOnly && <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-blue-300/15 bg-[#0b1728] p-6 sm:p-7"><h2 className="text-xl font-black">Account Information</h2><p className="mt-2 text-sm leading-6 text-slate-300">Keep your optional delivery details ready for future checkouts.</p><div className="mt-6 space-y-4"><label className="block text-sm font-bold">Display name<input value={profile.display_name || ""} onChange={(event) => setProfile({ ...profile, display_name: event.target.value })} maxLength={80} className="mt-2 w-full rounded-xl border border-blue-300/25 bg-[#07111f] px-4 py-3 outline-none focus:border-blue-300" placeholder="Your name" /></label>{notice && <p className="text-sm text-emerald-200">{notice}</p>}<button type="button" disabled={saving} onClick={saveProfile} className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-black hover:bg-blue-400 disabled:bg-slate-700">{saving ? "Saving…" : "Save Details"}</button></div></div>
          <div className="rounded-[1.75rem] border border-blue-300/15 bg-[#0b1728] p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Recent Orders</h2><Link href="/account/orders" className="text-sm font-bold text-blue-300 hover:text-white">View all</Link></div><OrderList orders={orders.slice(0, 4)} /></div>
        </section>}
        {ordersOnly && <section className="mt-8 rounded-[1.75rem] border border-blue-300/15 bg-[#0b1728] p-6 sm:p-7"><OrderList orders={orders} /></section>}
      </div>
    </main>
  );
}

export function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length) return <div className="mt-6 rounded-2xl border border-dashed border-blue-300/20 p-7 text-center text-sm text-slate-300">No account-linked orders yet. Future orders made while logged in will appear here.</div>;
  return <div className="mt-5 space-y-3">{orders.map((order) => <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-blue-300/15 bg-[#07111f] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-black text-white">Order #{order.payment_method === "Shopify" && order.xendit_reference_id ? order.xendit_reference_id : order.id}</p><p className="mt-1 truncate text-sm text-slate-300">{orderName(order)}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()} · {order.status || "Pending"}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className="font-black text-emerald-300">${Number(order.total_price || 0).toFixed(2)}</span><Link href={`/account/orders/${order.id}`} className="rounded-lg border border-blue-300/25 px-3 py-2 text-sm font-bold text-blue-200 hover:bg-white/5">View Order</Link></div></div>)}</div>;
}