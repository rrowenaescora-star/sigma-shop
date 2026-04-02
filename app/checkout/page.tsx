"use client";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  tag: string;
  stock: "In Stock" | "Limited" | "Out of Stock";
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  }, [cartItems]);
  async function handlePayPalSuccess(
  paypalOrderId: string,
  payerEmail: string | null
) {
  if (cartItems.length === 0) return;
  if (!robloxUsername.trim() || !contactInfo.trim()) {
    alert("Please fill in your Roblox username and contact info first.");
    return;
  }

  const orderResponse = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      robloxUsername,
      contactInfo,
      notes,
      items: cartItems,
      totalPrice,
      paypalOrderId,
      paymentStatus: "Paid",
      payerEmail,
    }),
  });

  const orderResult = await orderResponse.json();

  if (!orderResponse.ok) {
    alert(orderResult.error || "Order save failed.");
    return;
  }

  localStorage.setItem("real-last-order", JSON.stringify(orderResult.order));
  localStorage.removeItem("real-cart");
  setCartItems([]);
  setSubmitted(true);
}

  async function handlePlaceOrder(e: React.FormEvent) {
  e.preventDefault();

  if (cartItems.length === 0) return;
  if (!robloxUsername.trim() || !contactInfo.trim()) return;

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        robloxUsername,
        contactInfo,
        notes,
        items: cartItems,
        totalPrice,
      }),
    });

    const text = await response.text();
let result;

try {
  result = JSON.parse(text);
} catch {
  console.error("Non-JSON response:", text);
  alert("Server returned an invalid response. Check /api/orders.");
  return;
}

    if (!response.ok) {
      alert(result.error || "Failed to place order.");
      return;
    }

    localStorage.setItem("real-last-order", JSON.stringify(result.order));
    localStorage.removeItem("real-cart");
    setCartItems([]);
    setSubmitted(true);

  } catch (err) {
    alert("Something went wrong.");
    console.error(err);
  }
  
}
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Order Submitted
          </p>
          <h1 className="mt-4 text-4xl font-extrabold">Thank you for your order</h1>
          <p className="mt-4 text-slate-300">
            Your order has been recorded. Contact and username details were saved on
            this browser for now.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
            Roblox Username: <span className="font-bold">{robloxUsername}</span>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-12">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Checkout
          </p>
          <h1 className="mt-4 text-4xl font-extrabold">Complete your order</h1>
          <p className="mt-4 text-slate-300">
            Enter your Roblox username and contact info so the order can be handled.
          </p>

          <form onSubmit={handlePlaceOrder} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Roblox Username
              </label>
              <input
                type="text"
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                placeholder="Enter your Roblox username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email or Discord
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                placeholder="Enter your email or Discord"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                placeholder="Extra notes for your order"
              />
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-white/10 px-6 py-3 font-semibold"
              >
                Back
              </Link>

              <button
                type="submit"
                disabled={cartItems.length === 0}
                className={`rounded-2xl px-6 py-3 font-bold ${
                  cartItems.length === 0
                    ? "bg-slate-700 text-slate-300"
                    : "bg-cyan-400 text-slate-950"
                }`}
              >
                Place Order
              </button><div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
  <p className="mb-4 text-sm font-semibold text-slate-300">
    Pay with PayPal
  </p>

  <PayPalScriptProvider
    options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      currency: "USD",
      intent: "capture",
    }}
  >
    <PayPalButtons
      style={{ layout: "vertical" }}
      disabled={
        cartItems.length === 0 ||
        !robloxUsername.trim() ||
        !contactInfo.trim()
      }
      createOrder={async () => {
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalPrice,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create PayPal order.");
        }

        return data.id;
      }}
      onApprove={async (data) => {
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderID: data.orderID,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || "Failed to capture payment.");
          return;
        }

        await handlePayPalSuccess(
    result.orderID || data.orderID || "",
    result.payerEmail || null
  );
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        alert("PayPal checkout failed.");
      }}
    />
  </PayPalScriptProvider>
</div>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-8 shadow-xl">
          <h2 className="text-2xl font-extrabold">Order Summary</h2>

          <div className="mt-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">
                Your cart is empty.
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-slate-400">{item.tag}</p>
                    </div>
                    <p className="font-bold text-cyan-300">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-cyan-300">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
