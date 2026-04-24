"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: number;
  name: string;
  price: number;
  tag?: string | null;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  image_url?: string | null;
  is_active?: boolean;
};

type CartItem = Product & {
  quantity: number;
};

const OrderSummaryItem = memo(function OrderSummaryItem({
  item,
  unavailable = false,
}: {
  item: CartItem;
  unavailable?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        unavailable
          ? "border-red-400/20 bg-red-500/10"
          : "border-slate-700/60 bg-slate-900/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 rounded-xl border border-slate-700/60 bg-[#0b1628]">
            <span className="absolute -right-1 -top-1 z-10 flex min-w-[18px] items-center justify-center rounded-full border border-white/20 bg-slate-700/80 px-1 text-[10px] font-bold text-white backdrop-blur">
              {item.quantity}
            </span>

            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-[9px] text-slate-400">
                No Image
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white">{item.name}</h3>
            <p className="text-xs text-slate-400">{item.tag || "Service"}</p>
            {unavailable && (
              <p className="mt-1 text-[11px] font-semibold text-red-300">
                Unavailable
              </p>
            )}
          </div>
        </div>

        <p className="flex-shrink-0 text-sm font-extrabold text-white">
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

  const [usdToPhpRate, setUsdToPhpRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);

  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [productValidationMessage, setProductValidationMessage] = useState("");
  const [cartLoaded, setCartLoaded] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("real-cart", JSON.stringify(cartItems));
  }, [cartItems, cartLoaded]);

  useEffect(() => {
    async function loadRate() {
      try {
        setRateLoading(true);
        const res = await fetch("/api/exchange-rate", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.error || "Failed to load exchange rate.");
          return;
        }

        setUsdToPhpRate(Number(data.rate));
      } catch (error) {
        console.error("Exchange rate fetch failed:", error);
      } finally {
        setRateLoading(false);
      }
    }

    loadRate();
  }, []);

  useEffect(() => {
    refreshProductsForValidation();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("checkout-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          refreshProductsForValidation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (latestProducts.length === 0 || cartItems.length === 0) return;

    const updatedCart: CartItem[] = cartItems.map((item) => {
      const latest = latestProducts.find((p) => p.id === item.id);

      if (!latest) {
        return {
          ...item,
          stock: "Out of Stock",
          stock_quantity: 0,
          is_active: false,
        };
      }

      return {
        ...item,
        price: Number(latest.price),
        stock: latest.stock,
        stock_quantity: latest.stock_quantity ?? 0,
        image_url: latest.image_url ?? null,
        tag: latest.tag ?? item.tag ?? "Item",
        is_active: latest.is_active ?? false,
        quantity: item.quantity,
      };
    });

    const changed =
      updatedCart.length !== cartItems.length ||
      updatedCart.some((item, index) => {
        const old = cartItems[index];
        return (
          !old ||
          old.id !== item.id ||
          old.quantity !== item.quantity ||
          old.price !== item.price ||
          old.stock !== item.stock ||
          old.stock_quantity !== item.stock_quantity ||
          old.is_active !== item.is_active ||
          old.tag !== item.tag ||
          old.image_url !== item.image_url
        );
      });

    if (changed) {
      setCartItems(updatedCart);
    }

    const unavailableNames = updatedCart
      .filter((item) => {
        const stock = Number(item.stock_quantity ?? 0);
        return (
          item.is_active === false ||
          item.stock === "Out of Stock" ||
          stock <= 0
        );
      })
      .map((item) => item.name);

    if (unavailableNames.length > 0) {
      setProductValidationMessage(
        `Some items in your cart are no longer available: ${[
          ...new Set(unavailableNames),
        ].join(", ")}.`
      );
    } else {
      setProductValidationMessage("");
    }
  }, [latestProducts, cartItems]);

  async function refreshProductsForValidation() {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(result.error || "Failed to refresh products.");
        return;
      }

      setLatestProducts(result.products || []);
    } catch (error) {
      console.error("Failed to refresh checkout products:", error);
    }
  }

  function isCartItemUnavailable(item: CartItem) {
    const stock = Number(item.stock_quantity ?? 0);

    return (
      item.is_active === false ||
      item.stock === "Out of Stock" ||
      stock <= 0
    );
  }

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const finalPrice = useMemo(() => {
    return Math.max(totalPrice - discount, 0);
  }, [totalPrice, discount]);

  const estimatedPhpTotal = useMemo(() => {
    if (!usdToPhpRate || finalPrice <= 0) return null;
    const bufferMultiplier = 1.01;
    return Math.round(finalPrice * usdToPhpRate * bufferMultiplier * 100) / 100;
  }, [finalPrice, usdToPhpRate]);

  const hasUnavailableCartItems = useMemo(() => {
    return cartItems.some((item) => isCartItemUnavailable(item));
  }, [cartItems]);

  const isCheckoutDisabled =
    cartItems.length === 0 ||
    !robloxUsername.trim() ||
    !contactInfo.trim() ||
    !isVerified ||
    isSubmitting ||
    hasUnavailableCartItems;

  async function applyCoupon() {
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code.");
      setDiscount(0);
      setAppliedCoupon("");
      return;
    }

    try {
      await refreshProductsForValidation();

      const savedCart = localStorage.getItem("real-cart");
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : cartItems;

      const hasUnavailable = currentCart.some((item) =>
        isCartItemUnavailable(item)
      );

      if (hasUnavailable) {
        setCouponError("Your cart contains unavailable items.");
        return;
      }

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
      setVerifyError("Please enter your account or service username first.");
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
        setVerifyError(data.error || "Failed to verify account information.");
        return;
      }

      setRobloxUserId(Number(data.userId));
      setRobloxAvatar(data.avatarUrl || null);
      setRobloxDisplayName(data.displayName || "");
      setIsVerified(true);
    } catch (error) {
      console.error(error);
      setVerifyError("Failed to verify account information.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function validateCartBeforeSubmit() {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to validate cart.");
        return false;
      }

      const freshProducts: Product[] = result.products || [];
      setLatestProducts(freshProducts);

      for (const item of cartItems) {
        const latest = freshProducts.find((p) => p.id === item.id);

        if (!latest) {
          alert(`${item.name} is no longer available.`);
          return false;
        }

        const stock = Number(latest.stock_quantity ?? 0);

        if (
          latest.is_active === false ||
          latest.stock === "Out of Stock" ||
          stock <= 0
        ) {
          alert(`${item.name} is currently unavailable.`);
          return false;
        }

        if (Number(item.quantity) > stock) {
          alert(`${item.name} no longer has enough stock.`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Cart validation failed:", error);
      alert("Failed to validate your cart.");
      return false;
    }
  }

  async function saveOrder(paymentStatus: string) {
    if (cartItems.length === 0) return;

    if (!robloxUsername.trim() || !contactInfo.trim()) {
      alert("Please fill in your account/service information and email first.");
      return;
    }

    if (!isVerified || !robloxUserId) {
      alert("Please verify your account/service username first.");
      return;
    }

    const valid = await validateCartBeforeSubmit();
    if (!valid) return;

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
          xenditSessionId: null,
          xenditReferenceId: null,
          paymentMethod: finalPrice <= 0 ? "Free" : "Xendit",
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

  async function handleXenditCheckout() {
    if (cartItems.length === 0) return;

    if (!robloxUsername.trim() || !contactInfo.trim()) {
      alert("Please fill in your account/service information and email first.");
      return;
    }

    if (!isVerified || !robloxUserId) {
      alert("Please verify your account/service username first.");
      return;
    }

    const valid = await validateCartBeforeSubmit();
    if (!valid) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/xendit/checkout", {
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
          couponCode: appliedCoupon || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start payment.");
        return;
      }

      if (!data.checkoutUrl) {
        alert("Missing checkout URL.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting payment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d]/95 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur">
          <div>
            <p className="text-2xl font-black tracking-tight text-white">BLOXHOP</p>
            <p className="text-sm text-slate-400">Secure checkout for digital products and online services</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-200">Secure payment</span>
            <span className="hidden rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-blue-200 sm:inline-flex">Digital fulfillment</span>
            <span className="hidden rounded-full border border-slate-700/60 bg-slate-900/50 px-3 py-2 sm:inline-flex">Support available</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-2 text-sm font-semibold hover:bg-slate-800/70"
            >
              Back to Store
            </Link>
            <Link
              href="/track-order"
              className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-400"
            >
              Track Order
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className="xl:col-span-4 rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d] p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
                  Order Summary
                </p>
                <h1 className="mt-2 text-2xl font-extrabold">Order Summary</h1>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-right">
                <p className="text-xs text-slate-400">Items</p>
                <p className="text-lg font-black">{cartItems.length}</p>
              </div>
            </div>

            {productValidationMessage && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
                {productValidationMessage}
              </div>
            )}

            {hasUnavailableCartItems && (
              <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
                Your cart contains unavailable items.
              </div>
            )}

            <div className="mt-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 text-sm text-slate-300">
                  Your cart is empty.
                </div>
              ) : (
                cartItems.map((item) => (
                  <OrderSummaryItem
                    key={item.id}
                    item={item}
                    unavailable={isCartItemUnavailable(item)}
                  />
                ))
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
              {discount > 0 && (
                <div className="mb-2 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-300">
                    <span>Discount</span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {finalPrice <= 0
                    ? discount > 0
                      ? "FREE"
                      : "FREE"
                    : `$${finalPrice.toFixed(2)}`}
                </span>
              </div>

              {finalPrice > 0 && estimatedPhpTotal && (
                <div className="mt-1 flex items-center justify-between text-xs text-blue-300">
                  <span>Estimated PHP</span>
                  <span>
                    ≈ ₱
                    {estimatedPhpTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="xl:col-span-4 rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d] p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
                  Details
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">Customer Details</h2>
              </div>

              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-right">
                <p className="text-xs text-slate-400">Support</p>
                <p className="text-xs font-semibold text-white">support@bloxhop.site</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Account / Service Username
                </label>
                <div className="flex gap-2">
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
                    className="min-w-0 flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 outline-none"
                    placeholder="Enter username or service ID"
                    required
                  />
                  <button
                    type="button"
                    onClick={verifyRobloxUser}
                    disabled={verifyLoading || !robloxUsername.trim()}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      verifyLoading || !robloxUsername.trim()
                        ? "cursor-not-allowed bg-slate-700 text-slate-300"
                        : "bg-blue-500 text-white hover:bg-blue-400"
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
                        alt="Account avatar"
                        className="h-12 w-12 rounded-xl border border-slate-700/60 object-cover"
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
                      <p className="text-xs text-slate-400">Verified account information</p>
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
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 outline-none"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-black hover:bg-blue-400"
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
                  className="min-h-[96px] w-full rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 outline-none"
                  placeholder="Extra notes for your order or service request"
                />
              </div>
            </div>
          </section>

          <section className="xl:col-span-4 space-y-4">
            <div className="rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d] p-5 shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
                Important
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">Review Before Payment</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-3 text-sm text-slate-200">
                  <p className="font-semibold text-blue-300">Delivery</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Digital delivery or online service fulfillment begins after payment confirmation. Timing may vary depending on the selected product or service.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-100">
                  <p className="font-semibold text-emerald-300">Payment</p>
                  <p className="mt-1 text-xs">
                    Store prices are shown in USD. Checkout may be processed in PHP using the displayed estimate.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm text-yellow-100">
                  <p className="font-semibold text-yellow-300">Refunds</p>
                  <p className="mt-1 text-xs">
                    Refunds are reviewed for non-delivery, duplicate payment, or eligible fulfillment issues based on our refund policy.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3 text-sm text-white/80">
                  <p className="font-semibold text-white">Notice</p>
                  <p className="mt-1 text-xs">
                    All purchases are digital or online-based. No physical shipment is required, and fulfillment begins after payment confirmation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-700/60 bg-[#0f1b2d] p-5 shadow-xl">
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
                        : "bg-emerald-400 text-black hover:bg-blue-400"
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "Claim Free"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-2 text-sm font-semibold text-slate-300">
                    Secure Checkout
                  </p>

                  <div className="mb-4 rounded-2xl border border-blue-400/20 bg-blue-500/5 p-4">
                    <p className="text-sm text-slate-300">Store price</p>
                    <p className="text-2xl font-extrabold text-white">
                      ${finalPrice.toFixed(2)} USD
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Estimated payment amount
                    </p>

                    <p className="text-xl font-bold text-blue-300">
                      {rateLoading
                        ? "Loading PHP estimate..."
                        : estimatedPhpTotal
                        ? `≈ ₱${estimatedPhpTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} PHP`
                        : "PHP estimate unavailable"}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      Final PHP may vary slightly depending on the live exchange rate.
                    </p>
                  </div>

                  <div className="mb-4 grid gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                    <p className="font-semibold text-emerald-300">Checkout protection</p>
                    <p>Your order details are validated before payment and support is available through support@bloxhop.site.</p>
                  </div>

		
			
                  <div className="mt-4 flex items-start gap-2">
  <input
    type="checkbox"
    id="confirm"
    checked={confirmChecked}
    onChange={(e) => setConfirmChecked(e.target.checked)}
    className="mt-1 h-4 w-4 accent-blue-500"
  />

  <label htmlFor="confirm" className="text-xs text-slate-400 leading-5">
    I confirm that my account/service information and contact details are correct.
    I understand that incorrect details may result in fulfillment issues.
  </label>
</div>

<button
  type="button"
  onClick={handleXenditCheckout}
  disabled={!confirmChecked || isCheckoutDisabled}
  className={`w-full rounded-2xl py-3 font-bold transition ${
    !confirmChecked || isCheckoutDisabled
      ? "cursor-not-allowed bg-slate-700 text-slate-300"
      : "bg-blue-500 text-white hover:bg-blue-400"
  }`}
>
  {isSubmitting ? "Redirecting..." : "Secure Checkout"}
</button>
	
	

                  <p className="mt-3 text-xs text-slate-400">
                    You will be redirected to a secure payment page to complete your order.
                  </p>
                </>
              )}

              {isCheckoutDisabled && (
                <p className="mt-3 text-sm text-yellow-300">
                  Please verify your account/service information and confirm your contact details before proceeding with your order.
                </p>
              )}

              <p className="mt-4 text-[11px] leading-5 text-white/70">
                By submitting, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/refund-policy"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Refund Policy
                </Link>
                . You can also review our{" "}
                <Link
                  href="/privacy-policy"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Privacy Policy
                </Link>
               ,{" "}
                <Link
                  href="/delivery"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Delivery Policy
                </Link> 
		{" "}and{" "}
		<Link
                  href="/contact"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Contact Support
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}