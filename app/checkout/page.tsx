
"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  tag: string;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
};

type CartItem = Product & {
  quantity: number;
};

const OrderSummaryItem = memo(function OrderSummaryItem({
  item,
}: {
  item: CartItem;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-sm text-slate-400">{item.tag}</p>
          <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
        </div>
        <p className="font-bold text-cyan-300">
          ${(Number(item.price) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
});

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const finalPrice = useMemo(() => {
    return Math.max(totalPrice - discount, 0);
  }, [totalPrice, discount]);

  const isCheckoutDisabled =
    cartItems.length === 0 || !robloxUsername.trim() || !contactInfo.trim();

  async function applyCoupon() {
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code.");
      setDiscount(0);
      setAppliedCoupon("");
      return;
    }

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Failed to apply coupon.");
        setDiscount(0);
        setAppliedCoupon("");
        return;
      }

      setDiscount(Number(data.discount || 0));
      setAppliedCoupon(couponCode.trim().toUpperCase());
    } catch (error) {
      console.error(error);
      setCouponError("Something went wrong while applying coupon.");
      setDiscount(0);
      setAppliedCoupon("");
    }
  }

  async function handlePayPalSuccess(
    paypalOrderId: string,
    payerEmail: string | null,
    paidAmount: number
  ) {
    if (cartItems.length === 0) return;

    if (!robloxUsername.trim() || !contactInfo.trim()) {
      alert("Please fill in your Roblox username and contact info first.");
      return;
    }

    setIsSubmitting(true);

    try {
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
          totalPrice: Number(finalPrice.toFixed(2)),
          paypalOrderId,
          paymentStatus: "Paid",
          payerEmail,
          paidAmount: Number(paidAmount),
          couponCode: appliedCoupon || undefined,
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

      window.location.href = `/track-order?orderId=${orderResult.order.id}`;
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-12">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">
        <div className="bg-[#101729] p-8 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Checkout
          </p>
          <h1 className="mt-4 text-4xl font-extrabold">Complete your order</h1>
          <p className="mt-4 text-slate-300">
            Enter your Roblox username and contact info so the order can be handled.
          </p>

          <div className="mt-8 space-y-5">
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
                Email
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Coupon
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-xl bg-cyan-400 px-4 font-semibold text-black"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p className="mt-2 text-sm text-red-400">{couponError}</p>
              )}

              {!couponError && discount > 0 && (
                <p className="mt-2 text-sm text-green-400">
                  Coupon applied: -${discount.toFixed(2)}
                  {appliedCoupon ? ` (${appliedCoupon})` : ""}
                </p>
              )}
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
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
                  disabled={isCheckoutDisabled || isSubmitting}
                  forceReRender={[
                    Number(finalPrice.toFixed(2)),
                    robloxUsername,
                    contactInfo,
                    isSubmitting,
                    discount,
                    appliedCoupon,
                  ]}
                  createOrder={async () => {
                    const cleanFinalPrice = Number(finalPrice.toFixed(2));

                    console.log("Frontend totalPrice:", totalPrice);
                    console.log("Frontend discount:", discount);
                    console.log("Frontend finalPrice:", cleanFinalPrice);

                    if (!Number.isFinite(cleanFinalPrice) || cleanFinalPrice <= 0) {
                      throw new Error(`Invalid final price: ${cleanFinalPrice}`);
                    }

                    const response = await fetch("/api/paypal/create-order", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        totalPrice: cleanFinalPrice.toFixed(2),
                      }),
                    });

                    const data = await response.json();
                    console.log("Frontend /api/paypal/create-order result:", data);

                    if (!response.ok) {
                      throw new Error(data.error || "Failed to create PayPal order.");
                    }

                    if (!data?.id) {
                      throw new Error("Missing PayPal order ID.");
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
                      result.payerEmail || null,
                      Number(result.paidAmount || 0)
                    );
                  }}
                  onError={(err) => {
                    console.error("PayPal error:", err);
                    alert("PayPal checkout failed.");
                  }}
                />
              </PayPalScriptProvider>

              {isCheckoutDisabled && (
                <p className="mt-3 text-sm text-yellow-300">
                  Fill in your Roblox username and email before paying.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#101729] p-8 rounded-2xl border border-white/10 shadow-xl">
          <h2 className="text-2xl font-bold">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">
                Your cart is empty.
              </div>
            ) : (
              cartItems.map((item) => (
                <OrderSummaryItem key={item.id} item={item} />
              ))
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            {discount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="mt-1 flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="mt-2 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
