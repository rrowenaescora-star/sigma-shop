"use client";

import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Receipt = {
  items: { id?: number; name: string; price: number; quantity: number; image_url?: string | null }[];
  total_price: number;
  original_total: number | null;
  coupon_discount: number | null;
  coupon_code: string | null;
  created_at: string;
  roblox_username: string;
  payment_method: string;
};
type State = { loading: boolean; paid: boolean; orderId: string | null; receipt?: Receipt };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function PaymentSuccessPage() {
  const search = useSearchParams();
  const isFree = search.get("provider") === "free";
  const [state, setState] = useState<State>({ loading: true, paid: false, orderId: null });
  useEffect(() => {
    const orderId = search.get("orderId");
    if (!orderId) return;
    const controller = new AbortController();
    fetch((isFree ? "/api/orders/free-status?orderId=" : "/api/paypal/order-status?orderId=") + encodeURIComponent(orderId), { cache: "no-store", signal: controller.signal })
      .then(async response => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => setState({ loading: false, paid: ok && data.paid === true, orderId: ok ? String(data.orderId) : null, receipt: ok && data.paid === true ? data.receipt : undefined }))
      .catch(() => { if (!controller.signal.aborted) setState({ loading: false, paid: false, orderId: null }); });
    return () => controller.abort();
  }, [search, isFree]);
  const loading = state.loading && Boolean(search.get("orderId"));
  const receipt = state.paid ? state.receipt : undefined;
  const items = Array.isArray(receipt?.items) ? receipt.items : [];
  const subtotal = Number(receipt?.original_total ?? items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0));
  const total = Number(receipt?.total_price ?? 0);
  const discount = Number(receipt?.coupon_discount ?? 0);

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-10 text-slate-900 sm:py-16">
      <style>{`@media print { body * { visibility: hidden !important; } #order-receipt, #order-receipt * { visibility: visible !important; } #order-receipt { position: absolute; inset: 0 auto auto 0; width: 100%; border-radius: 0; box-shadow: none; overflow: visible; } #order-receipt button { display: none !important; } #order-receipt tr { break-inside: avoid; } }`}</style>
      <section className="mx-auto max-w-3xl">
        <div className="mb-6 text-center text-white">
          <p className="text-sm font-bold text-emerald-300">{loading ? "Confirming your order…" : state.paid ? "✓ Order confirmed" : "Order status unavailable"}</p>
          <h1 className="mt-2 text-3xl font-black">{state.paid ? "Thank you for your order!" : loading ? "Preparing your receipt" : "Unable to load receipt"}</h1>
          <p className="mt-3 text-sm text-slate-400">{state.paid ? "Your order is in the fulfillment queue. Keep this receipt for your records." : loading ? "Checking your order confirmation." : "Please use Track Order or contact support to check your order."}</p>
        </div>
        {receipt && <article id="order-receipt" className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 p-6 sm:p-9">
            <div><p className="text-xl font-black tracking-wide">BLOXHOP</p><p className="mt-1 text-xs tracking-widest text-slate-500">ONLINE STORE</p></div>
            <div className="sm:text-right"><h2 className="text-2xl font-bold">Order receipt</h2><p className="mt-2 font-mono text-xl font-black text-slate-900 sm:text-2xl">#{state.orderId}</p><span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{isFree ? "FREE ORDER · NO PAYMENT REQUIRED" : "PAID"}</span></div>
          </header>
          <div className="grid gap-5 bg-slate-50 px-6 py-5 text-sm sm:grid-cols-3 sm:px-9">
            <div><p className="text-xs font-semibold uppercase text-slate-500">Order date</p><p className="mt-1 font-medium">{new Date(receipt.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Delivery account</p><p className="mt-1 break-words font-medium">{receipt.roblox_username}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Payment method</p><p className="mt-1 font-medium">{isFree ? "Free claim" : receipt.payment_method}</p></div>
          </div>
          <div className="px-6 py-6 sm:px-9">
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead><tr className="border-b-2 border-slate-900 text-xs uppercase tracking-wide text-slate-500"><th className="pb-3 pr-3">Item</th><th className="px-2 pb-3 text-center">Qty</th><th className="whitespace-nowrap px-2 pb-3 text-right">Unit price</th><th className="pb-3 pl-3 text-right">Amount</th></tr></thead>
              <tbody>{items.map((item, index) => <tr key={`${item.id}-${index}`} className="border-b border-slate-100"><td className="min-w-40 py-5 pr-3 font-semibold"><div className="flex items-center gap-3">{item.image_url ? <Image src={item.image_url} alt={item.name} width={64} height={64} unoptimized className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-contain p-1 sm:h-16 sm:w-16" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-400">No image</span>}<span>{item.name}</span></div></td><td className="px-2 py-5 text-center">{item.quantity}</td><td className="whitespace-nowrap px-2 py-5 text-right tabular-nums">{money(Number(item.price))}</td><td className="whitespace-nowrap py-5 pl-3 text-right font-semibold tabular-nums">{money(Number(item.price) * Number(item.quantity))}</td></tr>)}</tbody>
            </table></div>
            <dl className="ml-auto mt-6 max-w-sm space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between gap-4 text-emerald-700"><dt>Discount {receipt.coupon_code && <span className="break-all">({receipt.coupon_code})</span>}</dt><dd className="whitespace-nowrap tabular-nums">−{money(discount)}</dd></div>}
              <div className="flex justify-between gap-4 border-t-2 border-slate-900 pt-4 text-lg font-black"><dt>Order total <span className="text-xs font-normal text-slate-500">USD</span></dt><dd className="tabular-nums">{money(total)}</dd></div>
              <div className="flex justify-between gap-4 text-slate-500"><dt>{isFree ? "Payment required" : "Amount paid"}</dt><dd className="tabular-nums">{money(total)}</dd></div>
            </dl>
          </div>
          <footer className="relative border-t border-dashed border-slate-300 px-6 pb-16 pt-5 text-center text-xs leading-6 text-slate-500 sm:px-9">Digital delivery · Track your order for fulfillment updates.<br />Thank you for shopping with Bloxhop Online Store.<button type="button" onClick={() => window.print()} aria-label="Download receipt as PDF" title="Download receipt as PDF" className="absolute bottom-4 left-6 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:left-9 print:hidden"><Download size={18} aria-hidden="true" /></button></footer>
        </article>}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-bold"><Link href={state.orderId ? `/track-order?orderId=${encodeURIComponent(state.orderId)}` : "/track-order"} className="rounded-xl bg-blue-500 px-6 py-3 text-white">Track Order</Link><Link href="/home" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-white">Back to Store</Link></div>
      </section>
    </main>
  );
}


