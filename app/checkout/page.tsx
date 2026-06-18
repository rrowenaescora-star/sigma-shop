"use client";

import Link from "next/link";
import { Suspense, memo, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

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
  currencyView,
  usdToPhpRate,
  usdToInrRate,
}: {
  item: CartItem;
  unavailable?: boolean;
  currencyView: "USD" | "PHP" | "INR";
  usdToPhpRate: number | null;
  usdToInrRate: number | null;
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
            <h3 className="truncate text-sm font-bold text-white">
              {item.name}
            </h3>
            <p className="text-xs text-slate-400">{item.tag || "Service"}</p>
            {unavailable && (
              <p className="mt-1 text-[11px] font-semibold text-red-300">
                Unavailable
              </p>
            )}
          </div>
        </div>

        <p className="flex-shrink-0 text-sm font-extrabold text-white">
          {currencyView === "USD" &&
            `$${(Number(item.price) * item.quantity).toFixed(2)}`}

          {currencyView === "PHP" &&
            usdToPhpRate &&
            `₱${(
              Number(item.price) *
              item.quantity *
              usdToPhpRate
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}

          {currencyView === "INR" &&
            usdToInrRate &&
            `₹${(
              Number(item.price) *
              item.quantity *
              usdToInrRate
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
        </p>
      </div>
    </div>
  );
});

function CheckoutPageContent() {
  const searchParams = useSearchParams();

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
  const [usdToInrRate, setUsdToInrRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [currencyView, setCurrencyView] = useState<"USD" | "PHP" | "INR">(
    "USD",
  );


  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [productValidationMessage, setProductValidationMessage] = useState("");
  const [cartLoaded, setCartLoaded] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  
  

useEffect(() => {
  const orderId = searchParams.get("orderId");

  if (!orderId) return;

  async function loadPendingOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });

      const order = await res.json();

      if (!res.ok) {
        alert(order.error || "Order not found.");
        return;
      }

      setRobloxUsername(order.roblox_username || "");
      setContactInfo(order.contact_info || "");
      setNotes(order.notes || "");
      setCartItems(order.items || []);
      setConfirmChecked(false);
      setIsVerified(false);

      localStorage.setItem("real-cart", JSON.stringify(order.items || []));
    } catch (error) {
      console.error("Failed to load pending order:", error);
      alert("Failed to load pending order.");
    }
  }

  loadPendingOrder();
}, [searchParams]);
  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency-view");

    if (
      savedCurrency === "USD" ||
      savedCurrency === "PHP" ||
      savedCurrency === "INR"
    ) {
      setCurrencyView(savedCurrency);
    }
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

        setUsdToPhpRate(Number(data.phpRate));
        setUsdToInrRate(Number(data.inrRate));
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
        },
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
        ].join(", ")}.`,
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
      item.is_active === false || item.stock === "Out of Stock" || stock <= 0
    );
  }

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
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

  const estimatedInrTotal = useMemo(() => {
    if (!usdToInrRate || finalPrice <= 0) return null;

    return Math.round(finalPrice * usdToInrRate * 100) / 100;
  }, [finalPrice, usdToInrRate]);

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
      const currentCart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : cartItems;

      const hasUnavailable = currentCart.some((item) =>
        isCartItemUnavailable(item),
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

  async function saveOrder(
    paymentStatus: string,
    paymentMethodOverride?: string,
    redirectPath = "/track-order",
  ) {
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
          paymentMethod:
            paymentMethodOverride || (finalPrice <= 0 ? "Free" : "Xendit"),
          paymentStatus,
          payerEmail: null,
          paidAmount: paymentStatus === "Free" ? 0 : null,
          couponCode: appliedCoupon || undefined,
          couponDiscount: Number(discount.toFixed(2)),
          originalTotal: Number(totalPrice.toFixed(2)),
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(orderResult.error || "Order save failed.");
        return;
      }

      localStorage.setItem(
        "real-last-order",
        JSON.stringify(orderResult.order),
      );
      localStorage.removeItem("real-cart");
      setCartItems([]);

      window.location.href = `${redirectPath}?orderId=${orderResult.order.id}`;
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
  async function handlePayMongoCheckout() {
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
      const res = await fetch("/api/paymongo", {
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
    <div className="min-h-screen bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.10),transparent_32%)]" />

      <div className="relative mx-auto max-w-[2550px] px-5 py-6 md:px-8">
        <header className="mb-2 flex flex-wrap w-full items-center justify-between gap-4 border-b border-blue-500/20 px-1 pb-5">
          <div>
            <p className="text-2xl font-black tracking-tight text-white">
              BLOXHOP
            </p>
            <p className="text-sm text-slate-400">
              Secure checkout for Blox Fruits items and online service
              fulfillment.
            </p>
          </div>

          
          <div className="flex flex-wrap gap-2">
            <Link
              href="/home"
              className="rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800/70"
            >
              Back to Store
            </Link>
            <Link
              href="/track-order"
              className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:bg-blue-400"
            >
              Track Order
            </Link>
          </div>
        </header>

       <main className="grid items-start gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-5">
            <div className="p-1">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-400">
                    Order Details
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                    Customer Details
                  </h1>
                  <p className="mt-2 text-sm text-slate-300">
                    Please provide your information accurately.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 px-4 py-3 text-xs text-slate-300">
                  Support:{" "}
                  <span className="font-bold text-white">
                    support@bloxhop.site
                  </span>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Roblox Username / Service Username
                  </label>
                  <div className="flex gap-3">
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
                      className="min-w-0 flex-1 rounded-2xl border border-blue-500/20 bg-transparent px-4 py-4 text-sm text-white outline-none ring-blue-500/20 placeholder:text-slate-500 focus:border-blue-400 focus:ring-4"
                      placeholder="Enter your Roblox username"
                      required
                    />
                    <button
                      type="button"
                      onClick={verifyRobloxUser}
                      disabled={verifyLoading || !robloxUsername.trim()}
                      className={`rounded-2xl px-6 py-4 text-sm font-black transition ${
                        verifyLoading || !robloxUsername.trim()
                          ? "cursor-not-allowed bg-slate-700 text-slate-300"
                          : "bg-blue-500 text-white hover:bg-blue-400"
                      }`}
                    >
                      {verifyLoading ? "Checking..." : "Verify"}
                    </button>
                  </div>

                 <div className="grid items-center gap-5 sm:grid-cols-[140px_1fr]">
    <div className="relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-[28px]">
      {verifyLoading ? (
        <div className="h-full w-full animate-pulse bg-slate-700/40" />
      ) : robloxAvatar ? (
        <img
          src={robloxAvatar}
          alt="Account avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[28px] bg-[#0b1728] text-sm font-bold text-slate-500">
  Avatar
</div>
      )}
    </div>

    <div className="grid gap-3">
      <div className="rounded-xl  px-5 py-3">
        {verifyLoading ? (
          <div className="h-7 w-40 animate-pulse rounded bg-slate-700/50" />
        ) : (
          <p className="truncate border-b border-blue-400/30 pb-2 text-3xl font-black text-white">
            {isVerified ? robloxDisplayName || robloxUsername : "Username Preview"}
          </p>
        )}
      </div>

      <div className="truncate border-b border-blue-400/30 px-5 py-2 pb-2">
        {verifyLoading ? (
          <div className="h-5 w-28 animate-pulse rounded bg-slate-700/50" />
        ) : (
          <p className={`text-lg font-black ${isVerified ? "text-emerald-300" : "text-slate-500"}`}>
            {isVerified ? "Verified" : "Waiting for verification"}
          </p>
        )}
      </div>

      <div className="truncate border-b border-blue-400/30 px-5 py-2">
        {verifyLoading ? (
          <div className="h-5 w-36 animate-pulse rounded bg-slate-700/50" />
        ) : (
          <p className="text-sm font-bold text-slate-400">
            {isVerified && robloxUserId
              ? `User ID: ${robloxUserId}`
              : "User ID will appear here"}
          </p>
        )}
      </div>
    </div>
  </div>
</div>
              

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Contact Information
                  </label>
                  <input
                    type="email"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full rounded-2xl border border-blue-500/20 bg-transparent px-4 py-4 text-sm text-white outline-none ring-blue-500/20 placeholder:text-slate-500 focus:border-blue-400 focus:ring-4"
                    placeholder="youremail@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Coupon Code (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="min-w-0 flex-1 rounded-2xl border border-blue-500/20 bg-transparent px-4 py-4 text-sm text-white outline-none ring-blue-500/20 placeholder:text-slate-500 focus:border-blue-400 focus:ring-4"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-2xl bg-blue-500 px-7 py-4 text-sm font-black text-white hover:bg-blue-400"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="mt-2 text-sm text-red-400">{couponError}</p>
                  )}
                  {!couponError && discount > 0 && (
                    <p className="mt-2 text-sm font-bold text-emerald-300">
                      Coupon applied: -${discount.toFixed(2)}
                      {appliedCoupon ? ` (${appliedCoupon})` : ""}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[112px] w-full rounded-2xl border border-blue-500/20 bg-transparent px-4 py-4 text-sm text-white outline-none ring-blue-500/20 placeholder:text-slate-500 focus:border-blue-400 focus:ring-4"
                    placeholder="Type your notes here..."
                  />
                </div>
              </div>
            </div>

            <div className="p-1">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Secure Checkout
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                Complete Your Order
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Review your details, then choose your checkout option.
              </p>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-500/20 p-4">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-blue-500"
                />
                <span className="text-sm leading-6 text-slate-300">
                  I confirm that my account/service information and contact
                  details are correct.
                </span>
              </label>
	<div className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
  <p className="text-xs leading-6 text-yellow-200">
    Online payment gateways are currently under application and verification.
    If checkout becomes unavailable, you may temporarily use the manual order option.
  </p>

</div>
{isCheckoutDisabled && (
                <p className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm font-semibold text-yellow-200">
                  Please verify your account and complete the required details
                  before checkout.
                </p>
              )}

              {finalPrice <= 0 ? (
                <button
                  type="button"
                  onClick={handleFreeCheckout}
                  disabled={isCheckoutDisabled}
                  className={`mt-5 w-full rounded-2xl py-4 text-lg font-black transition ${
                    isCheckoutDisabled
                      ? "cursor-not-allowed bg-slate-700 text-slate-300"
                      : "bg-emerald-400 text-black hover:bg-emerald-300"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Claim Free"}
                </button>
              ) : (
                <div className="mt-5 grid gap-3">
              	
                  <button
                    type="button"
                    onClick={handlePayMongoCheckout}
                    disabled={!confirmChecked || isCheckoutDisabled}
                    className={`w-full rounded-2xl border py-4 text-lg font-black transition ${
                      !confirmChecked || isCheckoutDisabled
                        ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-300"
                        : "border-blue-400/30 bg-[#10233c] text-white hover:bg-[#18345a]"
                    }`}
                  >
                    {isSubmitting ? "Redirecting..." : "Pay with Visa / Mastercard"}
                  </button>
<div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-400">
  <Link
    href="/terms"
    className="transition hover:text-white"
  >
    Terms
  </Link>

  <span className="text-slate-600">•</span>

  <Link
    href="/refund-policy"
    className="transition hover:text-white"
  >
    Refund Policy
  </Link>

  <span className="text-slate-600">•</span>

  <Link
    href="/privacy-policy"
    className="transition hover:text-white"
  >
    Privacy
  </Link>

  <span className="text-slate-600">•</span>

  <Link
    href="/delivery"
    className="transition hover:text-white"
  >
    Delivery
  </Link>

  <span className="text-slate-600">•</span>

  <Link
    href="/contact"
    className="transition hover:text-white"
  >
    Contact
  </Link>
</div>
                </div>
              )}

              
            </div>
          </section>

        <aside className="xl:sticky xl:top-6 xl:self-start xl:border-l xl:border-white/10 xl:pl-10">
            <div className="p-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-400">
                    Order Summary
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                    Items in Your Order
                  </h2>
                </div>
                <div className="rounded-2xl border border-blue-500/20 px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">Items</p>
                  <p className="text-xl font-black text-white">
                    {cartItems.length}
                  </p>
                </div>
              </div>

              {(productValidationMessage || hasUnavailableCartItems) && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {productValidationMessage ||
                    "Your cart contains unavailable items."}
                </div>
              )}

              <div className="mt-6 overflow-hidden border-y border-blue-500/20">
                {cartItems.length === 0 ? (
                  <div className="p-5 text-sm text-slate-300">
                    Your cart is empty.
                  </div>
                ) : (
                  <div
                    className={`divide-y divide-blue-500/10 ${showAllItems ? "max-h-[360px] overflow-y-auto" : "max-h-[360px] overflow-hidden"}`}
                  >
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 p-5 ${
                          isCartItemUnavailable(item) ? "bg-red-500/10" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-xl border border-blue-500/20 bg-[#06101d]">
                            <span className="absolute -right-2 -top-2 flex min-w-8 items-center justify-center rounded-xl border border-blue-500/20 bg-[#10233c] px-2 py-1 text-sm font-black text-white">
                              x{item.quantity}
                            </span>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black text-white">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {item.tag || "Item"}
                            </p>
                            {isCartItemUnavailable(item) && (
                              <p className="mt-1 text-xs font-bold text-red-300">
                                Unavailable
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="flex-shrink-0 text-xl font-black text-white">
                          {currencyView === "USD" &&
                            `$${(Number(item.price) * item.quantity).toFixed(2)}`}
                          {currencyView === "PHP" &&
                            usdToPhpRate &&
                            `₱${(
                              Number(item.price) *
                              item.quantity *
                              usdToPhpRate
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                          {currencyView === "INR" &&
                            usdToInrRate &&
                            `₹${(
                              Number(item.price) *
                              item.quantity *
                              usdToInrRate
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="mt-3 w-full rounded-2xl border border-blue-500/20 px-4 py-3 text-sm font-black text-slate-300 hover:bg-blue-500/10"
                >
                  {showAllItems
                    ? "Show Less Items"
                    : `Show All Items (${cartItems.length})`}
                </button>
              )}

              <div className="mt-6 border-t border-blue-500/20 pt-6">
                <div className="space-y-3 text-base">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>Discount</span>
                      <span>- ${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="my-5 h-px bg-blue-500/20" />

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">Total</span>
                  <span className="text-3xl font-black text-white">
                    {finalPrice <= 0 ? "FREE" : `$${finalPrice.toFixed(2)}`}
                  </span>
                </div>

                {finalPrice > 0 && estimatedPhpTotal && (
                  <div className="mt-4 flex items-center justify-between text-sm font-bold text-blue-300">
                    <span>Estimated in PHP</span>
                    <span>
                      ₱
                      {estimatedPhpTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[1.35rem] border border-yellow-400/30 p-5">
                  <p className="text-lg font-black text-yellow-300">
                    Important Reminder
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Do not submit another payment if your order is already
                    pending or confirmed.
                  </p>
                </div>

                <div className="rounded-[1.35rem] border border-blue-400/30 p-5">
                  <p className="text-lg font-black text-blue-300">
                    Need Support?
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Our support team is here to help.
                  </p>
                  <p className="mt-5 text-base font-black text-blue-300">
                    support@bloxhop.site
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#06101d] text-white" />}
    >
      <CheckoutPageContent />
    </Suspense>
  );
}