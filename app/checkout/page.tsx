"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  tag: string;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  image_url?: string | null;
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-2xl border border-white/10 bg-[#0c1324]">
            <span className="absolute -right-1 -top-1 z-10 flex min-w-[10px] items-center justify-center rounded-full border border-white/20 bg-white/20 px-1 text-xs font-bold text-white backdrop-blur">
              {item.quantity}
            </span>

            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-[10px] text-slate-400">
                No Image
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-white">{item.name}</h3>
            <p className="text-sm text-slate-400">{item.tag}</p>
          </div>
        </div>

        <p className="flex-shrink-0 text-lg font-extrabold text-white">
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

  const [robloxUserId, setRobloxUserId] = useState<number | null>(null);
  const [robloxAvatar, setRobloxAvatar] = useState<string | null>(null);
  const [robloxDisplayName, setRobloxDisplayName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

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
    cartItems.length === 0 ||
    !robloxUsername.trim() ||
    !contactInfo.trim() ||
    !isVerified ||
    isSubmitting;

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

  async function verifyRobloxUser() {
    if (!robloxUsername.trim()) {
      setVerifyError("Please enter a Roblox username first.");
      setIsVerified(false);
      return;
    }

    setVerifyLoading(true);
    setVerifyError("");
    setIsVerified(false);
    setRobloxUserId(null);
    setRobloxAvatar(null);
    setRobloxDisplayName("");

    try {
      const res = await fetch("/api/roblox/verify-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: robloxUsername.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.error || "Failed to verify Roblox user.");
        return;
      }

      setRobloxUserId(Number(data.userId));
      setRobloxAvatar(data.avatarUrl || null);
      setRobloxDisplayName(data.displayName || "");
      setIsVerified(true);
    } catch (error) {
      console.error(error);
      setVerifyError("Failed to verify Roblox user.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function saveOrder(paymentStatus: string) {
    if (cartItems.length === 0) return;

    if (!robloxUsername.trim() || !contactInfo.trim()) {
      alert("Please fill in your Roblox username and contact info first.");
      return;
    }

    if (!isVerified || !robloxUserId) {
      alert("Please verify your Roblox username first.");
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
          robloxUserId,
          robloxDisplayName,
          contactInfo,
          notes,
          items: cartItems,
          totalPrice: Number(finalPrice.toFixed(2)),
          paypalOrderId: null,
          paymentStatus,
          payerEmail: null,
          paidAmount: paymentStatus === "Free" ? 0 : null,
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

  async function handleFreeCheckout() {
    await saveOrder("Free");
  }

  async function handleManualCheckout() {
    await saveOrder("Manual Payment Pending");
  }

  return (
    <div className="min-h-screen bg-[#070b14] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#101729] p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Checkout
          </p>

          <h1 className="mt-4 text-4xl font-extrabold">Complete your order</h1>

          <p className="mt-4 text-slate-300">
            Enter your Roblox username and contact info so the order can be handled.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Support:{" "}
            <a
              href="mailto:support@bloxhop.site"
              className="underline underline-offset-4 hover:text-white"
            >
              support@bloxhop.site
            </a>
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-slate-200">
            <p className="font-semibold text-cyan-300">Delivery & Refund Info</p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>• Digital delivery usually takes 5 to 30 minutes</li>
              <li>• In rare cases, delivery may take up to 3 hours</li>
              <li>• Eligible nondelivery orders may qualify for a refund</li>
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-yellow-100">
            <p className="font-semibold text-yellow-300">Temporary Payment Notice</p>
            <ul className="mt-2 space-y-1">
              <li>• PayPal is temporarily unavailable</li>
              <li>• You can place your order now and pay manually after submission</li>
              <li>• Use your Order ID on the tracking page when contacting support</li>
            </ul>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Roblox Username
              </label>
              <input
                type="text"
                value={robloxUsername}
                onChange={(e) => {
                  setRobloxUsername(e.target.value);
                  setIsVerified(false);
                  setRobloxUserId(null);
                  setRobloxAvatar(null);
                  setRobloxDisplayName("");
                  setVerifyError("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                placeholder="Enter your Roblox username"
                required
              />

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={verifyRobloxUser}
                  disabled={verifyLoading || !robloxUsername.trim()}
                  className={`rounded-xl px-4 py-2 font-semibold transition ${
                    verifyLoading || !robloxUsername.trim()
                      ? "cursor-not-allowed bg-slate-700 text-slate-300"
                      : "bg-cyan-400 text-black hover:brightness-150"
                  }`}
                >
                  {verifyLoading ? "Checking..." : "Verify"}
                </button>
              </div>

              {verifyError && (
                <p className="mt-2 text-sm text-red-400">{verifyError}</p>
              )}

              {isVerified && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                  {robloxAvatar ? (
                    <img
                      src={robloxAvatar}
                      alt="Roblox avatar"
                      className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-slate-700" />
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-emerald-300">
                      {robloxDisplayName || robloxUsername}
                    </p>
                    <p className="truncate text-sm text-slate-300">
                      @{robloxUsername}
                    </p>
                    <p className="text-xs text-slate-400">
                      Verified Roblox account
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email
              </label>
              <input
                type="email"
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
                  className="rounded-xl bg-cyan-400 px-4 font-semibold text-black hover:brightness-150"
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
              {finalPrice <= 0 ? (
                <>
                  <p className="mb-4 text-sm font-semibold text-emerald-300">
                    {discount > 0
                      ? "Your coupon made this order free"
                      : "This order is free"}
                  </p>

                  <button
                    type="button"
                    onClick={handleFreeCheckout}
                    disabled={isCheckoutDisabled}
                    className={`w-full rounded-2xl py-3 font-bold transition ${
                      isCheckoutDisabled
                        ? "cursor-not-allowed bg-slate-700 text-slate-300"
                        : "bg-emerald-400 text-black hover:brightness-110"
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "🎁 Claim Free"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm font-semibold text-slate-300">
                    Manual payment checkout
                  </p>

                  <button
                    type="button"
                    onClick={handleManualCheckout}
                    disabled={isCheckoutDisabled}
                    className={`w-full rounded-2xl py-3 font-bold transition ${
                      isCheckoutDisabled
                        ? "cursor-not-allowed bg-slate-700 text-slate-300"
                        : "bg-cyan-400 text-black hover:brightness-110"
                    }`}
                  >
                    {isSubmitting ? "Creating Order..." : "Place Order"}
                  </button>

                  <p className="mt-3 text-sm text-slate-400">
                    After placing the order, use the tracking page and your Order ID to
                    contact support for manual payment instructions.
                  </p>
                </>
              )}

              {isCheckoutDisabled && (
                <p className="mt-3 text-sm text-yellow-300">
                  Fill in your Roblox username, verify it, and enter your email before continuing.
                </p>
              )}

              <p className="mt-4 text-xs leading-5 text-white/70">
                By purchasing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/refund"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Refund Policy
                </Link>
                . You can also review our{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/delivery"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Delivery Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101729] p-8 shadow-xl">
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
              <span>
                {finalPrice <= 0
                  ? discount > 0
                    ? "FREE (Coupon)"
                    : "FREE"
                  : `$${finalPrice.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}