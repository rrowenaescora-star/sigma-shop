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
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-sm text-slate-400">{item.tag}</p>
          <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
        </div>
        <p className="font-bold text-cyan-300">
          ${(item.price * item.quantity).toFixed(2)}
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
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // ✅ total
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  // ✅ discounted total
  const finalPrice = useMemo(() => {
    return Math.max(totalPrice - discount, 0);
  }, [totalPrice, discount]);

  const isCheckoutDisabled =
    cartItems.length === 0 || !robloxUsername.trim() || !contactInfo.trim();

  // ✅ APPLY COUPON
  async function applyCoupon() {
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code.");
      return;
    }

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error);
        setDiscount(0);
        setAppliedCoupon("");
        return;
      }

      setDiscount(Number(data.discount || 0));
      setAppliedCoupon(couponCode.toUpperCase());
    } catch (err) {
      console.error(err);
      setCouponError("Coupon failed.");
    }
  }

  // ✅ PAYPAL SUCCESS
  async function handlePayPalSuccess(
    paypalOrderId: string,
    payerEmail: string | null,
    paidAmount: number
  ) {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          robloxUsername,
          contactInfo,
          notes,
          items: cartItems,
          totalPrice: finalPrice,
          paypalOrderId,
          paymentStatus: "Paid",
          payerEmail,
          paidAmount,
          couponCode: appliedCoupon || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Order failed.");
        return;
      }

      localStorage.removeItem("real-cart");
      window.location.href = `/track-order?orderId=${data.order.id}`;
    } catch (err) {
      console.error(err);
      alert("Order failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-12">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">

        {/* LEFT */}
        <div className="bg-[#101729] p-8 rounded-2xl">
          <h1 className="text-3xl font-bold">Checkout</h1>

          {/* USER */}
          <input
            placeholder="Roblox Username"
            value={robloxUsername}
            onChange={(e) => setRobloxUsername(e.target.value)}
            className="mt-4 w-full p-3 rounded bg-white/5"
          />

          <input
            placeholder="Email"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="mt-4 w-full p-3 rounded bg-white/5"
          />

          {/* COUPON */}
          <div className="mt-4 flex gap-2">
            <input
              placeholder="Coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 p-3 rounded bg-white/5"
            />
            <button onClick={applyCoupon} className="bg-cyan-400 px-4 rounded">
              Apply
            </button>
          </div>

          {couponError && <p className="text-red-400 mt-2">{couponError}</p>}
          {discount > 0 && (
            <p className="text-green-400 mt-2">
              Discount: -${discount.toFixed(2)}
            </p>
          )}

          {/* PAYPAL */}
          <div className="mt-6">
            <PayPalScriptProvider
              options={{
                clientId:
                  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                currency: "USD",
              }}
            >
              <PayPalButtons
                disabled={isCheckoutDisabled || isSubmitting}
                forceReRender={[finalPrice]}
                createOrder={async () => {
                  if (finalPrice <= 0) throw new Error("Invalid price");

                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      totalPrice: Number(finalPrice).toFixed(2),
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) throw new Error(data.error);

                  return data.id;
                }}
                onApprove={async (data) => {
                  const res = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderID: data.orderID,
                    }),
                  });

                  const result = await res.json();

                  await handlePayPalSuccess(
                    result.orderID,
                    result.payerEmail,
                    result.paidAmount
                  );
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#101729] p-8 rounded-2xl">
          <h2 className="text-2xl font-bold">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <OrderSummaryItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            {discount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
