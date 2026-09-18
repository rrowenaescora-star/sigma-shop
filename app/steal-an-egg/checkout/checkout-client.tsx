"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PaypalCheckout from "@/components/paypal-checkout";

type CartItem = { id:number; name:string; price:number; quantity:number; image_url?:string|null; game?:string|null; stock?:string; stock_quantity?:number|null };

export default function StealAnEggCheckoutClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("real-cart") || "[]");
      setCart(Array.isArray(saved) ? saved : []);
    } catch { setCart([]); }
    setLoaded(true);
  }, []);

  const items = useMemo(() => cart.filter((item) => item.game === "steal-an-egg"), [cart]);
  const excluded = cart.length - items.length;
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
  const unavailable = items.some((item) => item.stock === "Out of Stock" || Number(item.stock_quantity ?? 1) <= 0);

  if (!loaded) return <main className="min-h-screen bg-[#031827] p-8 text-white">Loading secure checkout…</main>;

  return (
    <main className="min-h-screen bg-[#031827] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(0,181,216,.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(126,235,0,.12),transparent_34%)]" />
      <header className="relative border-b-4 border-black bg-gradient-to-r from-[#075f91] via-[#04b8cf] to-[#1955b9] shadow-[0_5px_0_#000]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/steal-an-egg" className="rounded-lg border-2 border-black bg-[#071b31] px-4 py-2 font-black text-white shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5">← Back to shop</Link>
          <div className="flex items-center gap-3"><img src="/steal-an-egg-icon.PNG" alt="Steal an Egg" className="h-12 w-12 rounded-md border-2 border-black bg-white object-contain"/><span className="text-lg font-black text-white [text-shadow:2px_2px_0_#000]">STEAL AN EGG CHECKOUT</span></div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-7 px-5 py-10 lg:grid-cols-[1.08fr_.92fr]">
        <section className="rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#087397]/90 to-[#07345f]/95 p-5 shadow-[7px_7px_0_#000] sm:p-7">
          <p className="inline-flex rounded-md border-2 border-black bg-[#7eeb00] px-3 py-1 text-xs font-black uppercase tracking-[.2em] text-black">Secure order</p>
          <h1 className="mt-4 text-4xl font-black text-white [text-shadow:3px_3px_0_#000]">Review your items</h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-cyan-50">You will choose your Roblox account only after PayPal confirms that payment was received.</p>
          {excluded > 0 && <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">{excluded} non–Steal an Egg item{excluded === 1 ? "" : "s"} will stay in your cart and will not be charged here.</div>}

          <div className="mt-7 space-y-3">
            {items.map((item) => <article key={item.id} className="flex items-center gap-4 rounded-xl border-[3px] border-black bg-[#f4fbff] p-3 text-[#07111f] shadow-[4px_4px_0_#000]"><img src={item.image_url || "/steal-an-egg-icon.PNG"} alt="" className="h-20 w-20 rounded-lg border-2 border-black bg-[#0d91bc] object-contain"/><div className="min-w-0 flex-1"><h2 className="truncate font-black">{item.name}</h2><p className="mt-1 text-sm font-bold text-slate-600">Quantity {item.quantity}</p></div><p className="text-xl font-black text-[#087397]">${(Number(item.price) * item.quantity).toFixed(2)}</p></article>)}
            {items.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/[.04] p-8 text-center"><p className="font-bold">Your Steal an Egg cart is empty.</p><Link href="/steal-an-egg" className="mt-4 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold">Browse products</Link></div>}
          </div>
        </section>

        <aside className="rounded-2xl border-[3px] border-black bg-gradient-to-b from-[#09bcd4] to-[#08699a] p-5 text-white shadow-[7px_7px_0_#000] sm:p-7">
          <h2 className="text-3xl font-black [text-shadow:2px_2px_0_#000]">Order summary</h2>
          <div className="mt-5 flex items-center justify-between border-b-2 border-black/40 pb-5 text-sm font-bold"><span className="text-slate-400">Items</span><span className="font-bold">{items.reduce((sum,item)=>sum+item.quantity,0)}</span></div>
          <div className="mt-5 flex items-center justify-between"><span className="font-bold">Total</span><span className="rounded-lg border-2 border-black bg-[#7eeb00] px-3 py-1 text-3xl font-black text-black shadow-[3px_3px_0_#000]">${total.toFixed(2)}</span></div>
          <div className="mt-6 rounded-xl border-2 border-black bg-[#07345f] p-4 text-xs font-semibold leading-5 text-cyan-50">Payment is verified on the server. Roblox instructions unlock only after PayPal reports the payment as completed.</div>
          <PaypalCheckout
            disabled={items.length === 0 || unavailable}
            createOrderEndpoint="/api/steal-an-egg/paypal/create-order"
            captureOrderEndpoint="/api/steal-an-egg/paypal/capture-order"
            successPath="/steal-an-egg/order"
            details={{ robloxUsername:"Pending after payment", robloxUserId:0, contactInfo:"Pending PayPal confirmation", notes:"STEAL_AN_EGG_POST_PAYMENT", items:items.map((item)=>({id:item.id,quantity:item.quantity})), fulfillmentFlow:"steal-an-egg" }}
          />
          {unavailable && <p className="mt-3 text-sm font-bold text-red-300">One or more items are currently unavailable.</p>}
        </aside>
      </div>
    </main>
  );
}