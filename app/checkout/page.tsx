"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import CustomerAvatarMenu from "@/components/customer-avatar-menu";
import SupportChat from "@/components/SupportChat";

type Product = {
  id: number;
  name: string;
  price: number;
  tag?: string | null;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  image_url?: string | null;
  is_active?: boolean;
  game?: string | null;
};

type CartItem = Product & {
  quantity: number;
};

const floatingItemPositions = [
  { top: "8%", left: "3%", size: "h-24 w-24", duration: "13s", delay: "-2s" },
  { top: "30%", left: "7%", size: "h-36 w-36", duration: "17s", delay: "-8s" },
  { top: "66%", left: "2%", size: "h-32 w-32", duration: "15s", delay: "-5s" },
  { top: "84%", left: "13%", size: "h-24 w-24", duration: "12s", delay: "-7s" },
  { top: "10%", right: "4%", size: "h-36 w-36", duration: "18s", delay: "-10s" },
  { top: "40%", right: "8%", size: "h-24 w-24", duration: "14s", delay: "-4s" },
  { top: "68%", right: "3%", size: "h-32 w-32", duration: "16s", delay: "-12s" },
  { top: "86%", right: "15%", size: "h-24 w-24", duration: "11s", delay: "-3s" },
];

const floatingProductNames = [
  ["black dragon"],
  ["beer", "bear"],
  ["unicorn"],
  ["racoon", "raccoon"],
  ["dark blade"],
  ["budha", "buddha"],
  ["permanent dragon"],
  ["permanent gravity"],
];

function CheckoutPageContent() {
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [emailWhyOpen, setEmailWhyOpen] = useState(false);
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
  const [termsAccepted, setTermsAccepted] = useState(false);

  const inputClass =
    "min-w-0 flex-1 rounded-lg border border-blue-400/40 bg-[#211f38] px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/20";

  const fullInputClass =
    "w-full rounded-lg border border-blue-400/40 bg-[#211f38] px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/20";useEffect(() => {
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
    const orderId = searchParams.get("orderId");

    if (orderId) {
      setCartLoaded(true);
      return;
    }

    const savedCart = localStorage.getItem("real-cart");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("real-cart");
      }
    }

    setCartLoaded(true);
  }, [searchParams]);  useEffect(() => {
    async function prefillCustomerDetails() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setContactInfo((current) => current || user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("roblox_username")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.roblox_username) {
        setRobloxUsername((current) => current || profile.roblox_username || "");
      }
    }
    prefillCustomerDetails();
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

  const hasUnavailableCartItems = useMemo(() => {
    return cartItems.some((item) => isCartItemUnavailable(item));
  }, [cartItems]);

  const floatingProducts = useMemo(() => {
    const withImages = latestProducts.filter(
      (product) => product.image_url && product.is_active !== false,
    );

    return floatingProductNames
      .map((aliases) =>
        withImages.find((product) => {
          const normalizedName = product.name.trim().toLowerCase();
          return aliases.some((alias) => normalizedName.includes(alias));
        }),
      )
      .filter((product): product is Product => Boolean(product));
  }, [latestProducts]);

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

      const hasUnavailable = cartItems.some((item) =>
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
            paymentMethodOverride || (finalPrice <= 0 ? "Free" : "PayMongo"),
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

 async function handleManualCheckout() {
  await saveOrder(
    "Pending",
    "Manual International Payment",
    "/manual-payment",
  );
}

  async function handleSmartCheckout() {
    await handleShopifyCheckout();
  }

  async function handleShopifyCheckout() {
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
          paymentMethod: "Shopify",
          paymentStatus: "Pending",
          payerEmail: contactInfo,
          couponCode: appliedCoupon || undefined,
          couponDiscount: Number(discount.toFixed(2)),
          originalTotal: Number(totalPrice.toFixed(2)),
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(orderResult.error || "Order save failed before Shopify checkout.");
        return;
      }

      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          orderId: orderResult.order.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start Shopify checkout.");
        return;
      }

      if (!data.checkoutUrl) {
        alert("Missing checkout URL.");
        return;
      }

      localStorage.setItem("real-last-order", JSON.stringify(orderResult.order));
      window.location.href = `${data.checkoutUrl}&note=order-${orderResult.order.id}`;
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting Shopify checkout.");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="relative min-h-screen overflow-x-clip bg-[#12111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(120,58,237,0.08),transparent_34%)]" />

      <div aria-hidden="true" className="hidden">
        {floatingProducts.map((product, index) => {
          const position = floatingItemPositions[index];

          return (
            <div
              key={`${product.game}-${product.id}`}
              className={`checkout-floating-item absolute ${position.size}`}
              style={{
                top: position.top,
                left: position.left,
                right: position.right,
                animationDuration: position.duration,
                animationDelay: position.delay,
              }}
            >
              <img
                src={product.image_url || ""}
                alt=""
                className="h-full w-full object-contain opacity-75"
              />
            </div>
          );
        })}
      </div>

      <div className="relative z-40 w-full overflow-hidden border-b border-white/10 bg-[#12111f]">
        <img src="/header4.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-[#12111f]/75" />
        <div className="relative mx-auto flex max-w-[1064px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/home")}
              aria-label="Back to product page"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/20 text-xl font-bold text-white transition hover:bg-white/10"
            >
              ←
            </button>
            <img src="/logo.png" alt="Bloxhop" className="h-12 w-12 object-contain" />
          </div>
          <CustomerAvatarMenu />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1064px] px-4 py-10 sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 -top-10 left-[53%] hidden w-0.5 bg-white/20 lg:block" />

        <main className="grid items-start lg:grid-cols-[minmax(0,1.06fr)_minmax(360px,.94fr)]">
          <section className="space-y-6 lg:pr-12">
            <div className="border-0 bg-transparent p-0 sm:p-0">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>

                  <h1 className="text-3xl font-black tracking-tight text-white">
                    Delivery Details
                  </h1>

                  <p className="mt-2 text-sm text-slate-300">
                    Please provide your information accurately.
                  </p>
                </div>

                <div className="hidden">
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

                  <div className="flex flex-col gap-3 sm:flex-row">
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
                      className={inputClass}
                      placeholder="Enter your Roblox username"
                      required
                    />

                    <button
                      type="button"
                      onClick={verifyRobloxUser}
                      disabled={verifyLoading || !robloxUsername.trim()}
                     className={`rounded-lg px-6 py-4 text-sm font-black transition ${
  verifyLoading || !robloxUsername.trim()
    ? "cursor-not-allowed bg-slate-700 text-slate-300"
    : "cursor-pointer bg-violet-600 text-white hover:bg-violet-500"
}`}
                    >
                      {verifyLoading ? "Checking..." : "Verify"}
                    </button>
                  </div>

                  {verifyError && (
                    <p className="mt-2 text-sm font-semibold text-red-400">
                      {verifyError}
                    </p>
                  )}

                  <div className="mt-4 grid items-center gap-5 rounded-lg border border-white/10 bg-[#1d1c31] p-4 sm:grid-cols-[120px_1fr]">
                    <div className="relative flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[#211f38]">
                      {verifyLoading ? (
                        <div className="h-full w-full animate-pulse bg-slate-700/40" />
                      ) : robloxAvatar ? (
                        <img
                          src={robloxAvatar}
                          alt="Account avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
                          Avatar
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3">
                      <p className="truncate border-b border-white/10 pb-2 text-2xl font-black text-white">
                        {isVerified
                          ? robloxDisplayName || robloxUsername
                          : "Username Preview"}
                      </p>

                      <p
                        className={`truncate border-b border-white/10 pb-2 text-lg font-black ${
                          isVerified ? "text-emerald-300" : "text-slate-500"
                        }`}
                      >
                        {isVerified ? "Verified" : "Waiting for verification"}
                      </p>

                      <p className="truncate text-sm font-bold text-slate-400">
                        {isVerified && robloxUserId
                          ? `User ID: ${robloxUserId}`
                          : "User ID will appear here"}
                      </p>
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
                    className={fullInputClass}
                    placeholder="youremail@example.com"
                    required
                  />                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setEmailWhyOpen((open) => !open)}
                      aria-expanded={emailWhyOpen}
                      className="flex items-center gap-2 text-left text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-300/70 text-xs text-violet-200">?</span>
                      Why do we ask for your email?
                    </button>
                    {emailWhyOpen && (
                      <p className="mt-2 rounded-lg border border-white/10 bg-[#1d1c31] px-3 py-2 text-xs leading-5 text-slate-300">
                        We use it to send your order updates and digital delivery details.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-0 bg-transparent p-0 sm:p-0">

              <h2 className="text-3xl font-black tracking-tight text-white">
                Payment
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                Review your details, agree to the policies, then continue to payment.
              </p>

              <div className="mt-5 grid gap-3 rounded-lg border border-white/10 bg-[#1d1c31] p-4 text-sm font-bold text-slate-300 sm:grid-cols-3">
                <p>✓ Secure Checkout</p>
                <p>✓ Order Confirmation</p>
                <p>✓ Digital Fulfillment</p>
              </div>
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-white/10 bg-[#1d1c31] p-4">
                <input
                  type="checkbox"
                  id="terms-acceptance"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-500"
                />

                <label
                  htmlFor="terms-acceptance"
                  className="text-sm leading-6 text-slate-300"
                >
                  I have read and agree to Bloxhop&apos;s{" "}
                  <Link href="/terms" className="font-semibold text-blue-300 hover:underline">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link href="/privacy-policy" className="font-semibold text-blue-300 hover:underline">
                    Privacy Policy
                  </Link>
                  ,{" "}
                  <Link href="/refund-policy" className="font-semibold text-blue-300 hover:underline">
                    Refund Policy
                  </Link>
                  , and{" "}
                  <Link href="/delivery" className="font-semibold text-blue-300 hover:underline">
                    Delivery Policy
                  </Link>
                  . I understand that my order is subject to these policies.
                </label>
              </div>

              {finalPrice <= 0 ? (
                <button
                  type="button"
                  onClick={handleFreeCheckout}
                  disabled={isCheckoutDisabled || !termsAccepted}
                  className={`mt-5 w-full rounded-lg py-4 text-lg font-black transition ${
                    isCheckoutDisabled || !termsAccepted
                      ? "cursor-not-allowed bg-slate-700 text-slate-300"
                      : "cursor-pointer bg-emerald-400 text-black hover:bg-emerald-300"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Claim Free"}
                </button>
              ) : (
                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={handleSmartCheckout}
                    disabled={!termsAccepted || isCheckoutDisabled}
                   className={`w-full rounded-lg border py-4 text-lg font-black transition ${
  !termsAccepted || isCheckoutDisabled
    ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-300"
    : "cursor-pointer border-white/10 bg-[#10233c] text-white hover:bg-[#18345a]"
}`}
                  >
                    {isSubmitting ? "Redirecting..." : "Proceed to Secure Checkout"}
                  </button>

                  <p className="text-center text-xs font-semibold text-slate-400">
                    After payment approval, your order continues through our normal fulfillment flow.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-400">
                    <Link href="/terms" className="transition hover:text-white">
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

          <aside className="border-t border-white/10 pt-10 lg:sticky lg:top-0 lg:self-start lg:border-t-0 lg:pt-0">
            <div className="flex min-h-[700px] flex-col bg-transparent p-0 lg:pl-16">
              <div className="flex items-start justify-between gap-4">
                <div>

                  <h2 className="text-3xl font-black tracking-tight text-white">
                    Order summary
                  </h2>
                </div>

                <div className="rounded-lg border border-white/10 px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">Items</p>
                  <p className="text-xl font-black text-white">
                    {cartItems.length}
                  </p>
                </div>
              </div>

              {(productValidationMessage || hasUnavailableCartItems) && (
                <div className="mt-5 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {productValidationMessage ||
                    "Your cart contains unavailable items."}
                </div>
              )}

              <div className="mt-6">
                  <label className="mb-2 block text-sm font-bold text-white">
                    Discount code or gift card
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className={inputClass}
                      placeholder="Discount code or gift card"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="cursor-pointer rounded-lg bg-[#2a293e] px-7 py-4 text-sm font-black text-white hover:bg-[#37354f]"
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

                
              <div className="mt-8 overflow-hidden border-y border-white/10">
                {cartItems.length === 0 ? (
                  <div className="p-5 text-sm text-slate-300">
                    Your cart is empty.
                  </div>
                ) : (
                  <div
                    className="max-h-[300px] divide-y divide-blue-500/10 overflow-y-auto"
                  >
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 p-4 ${
                          isCartItemUnavailable(item) ? "bg-red-500/10" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-xl border border-blue-500/20 bg-[#12111f]">
                            <span className="absolute -right-2 -top-2 flex min-w-7 items-center justify-center rounded-xl border border-blue-500/20 bg-[#10233c] px-2 py-1 text-xs font-black text-white">
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
                            <h3 className="truncate text-base font-black text-white">
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

                        <p className="flex-shrink-0 text-base font-black text-white">
                          {currencyView === "USD" &&
                            `$${(
                              Number(item.price) * item.quantity
                            ).toFixed(2)}`}

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

              <div className="mt-auto border-t border-white/10 pt-6">
                <div className="space-y-3 text-base">

                  {discount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>Discount</span>
                      <span>- ${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="my-5 h-px bg-white/10" />

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
            </div>
          </aside>
        </main>
      </div>
      <SupportChat />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#12111f] text-white" />}
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
