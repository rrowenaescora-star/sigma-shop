"use client";

import Link from "next/link";
import CustomerAvatarMenu from "@/components/customer-avatar-menu";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import TrustBadges from "@/components/TrustBadges";
import LazySupportChat from "@/components/lazy-support-chat";
import CheckoutPrefetch from "@/components/checkout-prefetch";
import DeferredProductRealtime from "@/components/deferred-product-realtime";
import ProductFilterSidebar from "@/components/ProductFilterSidebar";
import PageTransitionLink from "@/components/page-transition-link";


type Product = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_value?: number | null;
  tag: string | null;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  game?: string | null;
};

const CLAIMED_ORDER_BROWSER_KEY = "bloxhop-steal-an-egg-active-order";

type CartItem = Product & {
  quantity: number;
};

function ProductSkeletonCard() {
  return (
    <div className="relative flex aspect-[3/4] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-600/60 bg-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      <div className="relative h-[42%] min-h-[125px] shrink-0 overflow-hidden border-b border-slate-700/70 bg-gradient-to-br from-emerald-500/20 via-[#07111f] to-blue-700/20">
        <div className="skeleton absolute right-4 top-4 h-6 w-16 rounded-full" />
        <div className="flex h-full items-center justify-center p-5">
          <div className="skeleton h-[68%] w-[68%] max-h-[150px] max-w-[150px] rounded-2xl" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-[#07111f] p-3">
        <div className="skeleton h-5 w-3/4 rounded-md" />
        <div className="mt-2 skeleton h-3 w-1/2 rounded-md" />
        <div className="mt-4 flex items-center gap-2">
          <div className="skeleton h-6 w-20 rounded-md" />
          <div className="skeleton h-3 w-12 rounded-md" />
        </div>
        <div className="mt-auto mb-1 skeleton h-8 w-full rounded-lg" />
      </div>

      <style jsx global>{`
        @keyframes productAppear {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-120%) rotate(5deg);
          }

          100% {
            transform: translateX(120%) rotate(5deg);
          }
        }

        @keyframes premiumFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }

          50% {
            transform: translateX(-50%) translateY(-6px);
          }
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(24px, -18px, 0) scale(1.08);
          }
        }

        @keyframes starDrift {
          0% {
            transform: translateY(0);
          }

          100% {
            transform: translateY(-80px);
          }
        }
      `}</style>

    </div>
  );
}

const LUMINOUS_EVENT_ENDS_AT = 1790434808468;

function formatLuminousCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}
export default function Storefront({ initialProducts, initialCapital, initialPhpRate, initialInrRate }: { initialProducts: Product[]; initialCapital: number | null; initialPhpRate: number | null; initialInrRate: number | null }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "in-stock">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [currencyView, setCurrencyView] = useState<"USD" | "PHP" | "INR">("USD");
  const [usdToPhpRate] = useState<number | null>(initialPhpRate);
  const [usdToInrRate] = useState<number | null>(initialInrRate);
  const rateLoading = false;
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [luminousCountdown, setLuminousCountdown] = useState("8d 19h 35m 00s");

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [flyingCardProduct, setFlyingCardProduct] = useState<Product | null>(null);
  const [cartHit, setCartHit] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimOrderId, setClaimOrderId] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimedOrderUrl, setClaimedOrderUrl] = useState("");
  const [claimFrameHeight, setClaimFrameHeight] = useState(560);

  // NEW: capital amount available for fulfilling orders.
  // Products still show, but if capital is lower than the product price, Add to Cart becomes unavailable.
  const [availableCapital] = useState<number | null>(initialCapital);


  const PRODUCTS_PER_PAGE = 18;

useEffect(() => {
  setMounted(true);
  const savedOrderUrl = localStorage.getItem(CLAIMED_ORDER_BROWSER_KEY);
  if (savedOrderUrl) {
    try {
      const parsed = new URL(savedOrderUrl, window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname === "/steal-an-egg/order") {
        setClaimedOrderUrl(parsed.pathname + parsed.search);
        setClaimOpen(true);
      } else {
        localStorage.removeItem(CLAIMED_ORDER_BROWSER_KEY);
      }
    } catch {
      localStorage.removeItem(CLAIMED_ORDER_BROWSER_KEY);
    }
  }
}, []);

useEffect(() => {
  function closeCompletedOrder(event: MessageEvent) {
    if (event.origin === window.location.origin && event.data?.type === "steal-an-egg-order-completed-close") {
      localStorage.removeItem(CLAIMED_ORDER_BROWSER_KEY);
      setClaimedOrderUrl("");
      setClaimOpen(false);
    }
  }
  window.addEventListener("message", closeCompletedOrder);
  return () => window.removeEventListener("message", closeCompletedOrder);
}, []);

useEffect(() => {
  const updateCountdown = () => {
    setLuminousCountdown(formatLuminousCountdown(LUMINOUS_EVENT_ENDS_AT - Date.now()));
  };

  updateCountdown();
  const timer = window.setInterval(updateCountdown, 1000);
  return () => window.clearInterval(timer);
}, []);

   useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setCartReady(true);

  }, []);

  useEffect(() => {
    try {
      const language = navigator.language?.toLowerCase() || "";
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

      const looksPhilippines =
        language.includes("ph") ||
        language.includes("fil") ||
        timeZone === "Asia/Manila";

      setCurrencyView(looksPhilippines ? "PHP" : "USD");
    } catch (error) {
      console.error("Currency auto-detect failed:", error);
      setCurrencyView("USD");
    }
  }, []);

  useEffect(() => {
    function syncCart(event: StorageEvent) {
      if (event.key === "real-cart") {
        const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
        setCartItems(updatedCart);
      }
    }

    function syncDetailCart() {
      const savedCart = localStorage.getItem("real-cart");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    }

    window.addEventListener("storage", syncCart);
    window.addEventListener("bloxhop-cart-updated", syncDetailCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("bloxhop-cart-updated", syncDetailCart);
    };
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem("real-cart", JSON.stringify(cartItems));
  }, [cartItems, cartReady]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, availabilityFilter, searchQuery, sortOption]);

  async function claimOrder() {
    setClaimLoading(true);
    setClaimMessage("");
    try {
      const response = await fetch("/api/steal-an-egg/recover-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: claimOrderId, email: claimEmail }) });
      const data = await response.json();
      if (!response.ok || !data.redirectUrl) {
        setClaimMessage(data.error || "We could not verify those order details.");
        return;
      }
      const instructionUrl=data.redirectUrl+(data.redirectUrl.includes("?") ? "&" : "?")+"embedded=1";
      localStorage.setItem(CLAIMED_ORDER_BROWSER_KEY,instructionUrl);
      setClaimedOrderUrl(instructionUrl);
    } catch {
      setClaimMessage("Order access could not be restored. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  }
  async function loadProducts() {
    try {
      setLoadingProducts(true);

      const response = await fetch("/api/products?game=steal-an-egg", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        return;
      }

    const mm2Products = (result.products || []).filter(
  (product: Product) => product.game === "steal-an-egg"
);

setProducts(mm2Products);


    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  }

  function getStockLabel(product: Product) {
    const quantity = Number(product.stock_quantity ?? 0);

    if (quantity <= 0) return "Out of Stock";
    if (quantity <= 3) return "Limited";
    return product.stock || "In Stock";
  }

 function isCapitalUnavailable(product: Product) {
  const requiredCapital = Number(product.cost_value ?? product.price ?? 0);

  return availableCapital !== null && availableCapital < requiredCapital;
}

  function isUnavailable(product: Product) {
    const quantity = Number(product.stock_quantity ?? 0);

    return (
      quantity <= 0 ||
      product.stock === "Out of Stock" ||
      product.is_active === false ||
      isCapitalUnavailable(product)
    );
  }

  function getUnavailableReason(product: Product) {
    const quantity = Number(product.stock_quantity ?? 0);

    if (product.is_active === false) return "Out of Stock";
    if (quantity <= 0 || product.stock === "Out of Stock") return "Out of stock";
    if (isCapitalUnavailable(product)) return "Out of Stock";

    return "Unavailable";
  }

  function getDiscountPercent(product: Product) {
    const compareAt = Number(product.compare_at_price ?? 0);
    const current = Number(product.price ?? 0);

    if (!compareAt || compareAt <= current) return null;

    return Math.round(((compareAt - current) / compareAt) * 100);
  }


  function handleBuy(product: Product) {
    if (isUnavailable(product)) {
      return;
    }

    const existingItem = cartItems.find((item) => item.id === product.id);
    const availableStock = Number(product.stock_quantity ?? 0);

    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  }

  function increaseQuantity(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const maxStock = Number(product.stock_quantity ?? 0);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < maxStock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id: number) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }
function formatMoney(usdAmount: number) {
  if (currencyView === "USD") return `$${usdAmount.toFixed(2)}`;

  if (currencyView === "PHP" && usdToPhpRate) {
    return `₱${(usdAmount * usdToPhpRate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (currencyView === "INR" && usdToInrRate) {
    return `₹${(usdAmount * usdToInrRate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${usdAmount.toFixed(2)}`;
}

  function formatPhp(usdAmount: number) {
    if (!usdToPhpRate) return null;
    return usdAmount * usdToPhpRate;
  }

  function formatInr(usdAmount: number) {
  if (!usdToInrRate) return null;
  return usdAmount * usdToInrRate;

  }

  function renderPrice(product: Product) {
    const usd = Number(product.price);
    const php = formatPhp(usd);
    const inr = formatInr(usd);

    if (currencyView === "USD") {
      return (
        <p className="text-xl font-extrabold leading-none text-emerald-300">
          ${usd.toFixed(2)}
        </p>
      );
    }

    if (currencyView === "PHP") {
      return (
        <p className="text-xl font-extrabold leading-none text-emerald-300">
          {php
            ? `₱${php.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "PHP unavailable"}
        </p>
      );
    }

	if (currencyView === "INR") {
    return (
       <p className="text-xl font-extrabold leading-none text-emerald-300">
        {inr
          ? `₹${inr.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
           })}`
          : "INR unavailable"}
       </p>
    );
  }

    return (
      <div>
        <p className="text-xl font-extrabold leading-none text-emerald-300">
          ${usd.toFixed(2)}
        </p>
        <p className="mt-1 text-sm text-emerald-200">
          {rateLoading
            ? "Loading PHP estimate..."
            : php
            ? `≈ ₱${php.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "PHP estimate unavailable"}
        </p>
      </div>
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const visibleProducts = useMemo(
    () => products.filter((product) => (product.tag || "").trim().toLowerCase() !== "hide"),
    [products]
  );

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        visibleProducts
          .map((product) => product.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    );

    return ["All", ...uniqueCategories];
  }, [visibleProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = visibleProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (product.category || "").trim() === selectedCategory;

      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query) ||
        (product.category || "").toLowerCase().includes(query) ||
        (product.tag || "").toLowerCase().includes(query);

      const matchesAvailability =
        availabilityFilter === "all" || !isUnavailable(product);

      return matchesCategory && matchesAvailability && matchesSearch;
    });

    const sorted = [...filtered];

    if (sortOption === "price-low-high") {
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high-low") {
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === "name-a-z") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-z-a") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    return sorted;
  }, [visibleProducts, selectedCategory, availabilityFilter, searchQuery, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

useEffect(() => {
  if (loadingProducts) return;

  const hash = window.location.hash;
  if (!hash) return;

  const id = hash.replace("#", "");

  setTimeout(() => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

 const foundProduct = products.find(
  (product) =>
    (product.slug || product.name).toLowerCase().replace(/\s+/g, "-") === id
);

if (foundProduct) {
  setPopupProduct(foundProduct);
}
    }
  }, 300);
}, [loadingProducts, paginatedProducts]);


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="relative min-h-screen bg-[#031827] text-white">
<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(0,181,216,.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(126,235,0,.14),transparent_32%)]" />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-[12%] h-72 w-72 animate-[orbFloat_9s_ease-in-out_infinite] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute right-[8%] top-[18%] h-96 w-96 animate-[orbFloat_12s_ease-in-out_infinite] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[12%] left-[18%] h-80 w-80 animate-[orbFloat_11s_ease-in-out_infinite] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_12%_22%,rgba(255,255,255,0.24)_0_1px,transparent_2px),radial-gradient(circle_at_32%_70%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_74%_35%,rgba(255,255,255,0.20)_0_1px,transparent_2px),radial-gradient(circle_at_88%_78%,rgba(255,255,255,0.14)_0_1px,transparent_2px)] animate-[starDrift_18s_linear_infinite]" />
      </div>

     <div className="relative w-full px-0 pt-[140px]">
    
<div className="fixed inset-x-0 top-0 z-50">
  <div className="overflow-visible border-b-4 border-black bg-gradient-to-r from-[#087397] via-[#09bcd4] to-[#1955b9] shadow-[0_6px_0_#000]">
    <div className="absolute inset-0 hidden md:block">
      <img
        src="/steal-an-egg-logo.png"
        alt="Background"
        className="h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07345f]/90 via-[#09bcd4]/60 to-[#07345f]/90" />
    </div>

   <div className="relative mx-auto flex max-w-[1850px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
    <Link
  href="/"
  className="flex items-center gap-4 pl-3 transition hover:opacity-90"
>

  <img
    src="/logo.webp"
    alt="Bloxhop"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className="text-base font-black leading-none tracking-tight text-white sm:text-xl">
      BLOXHOP ONLINE STORE
    </h1>
  </div>
</Link>

    <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:justify-end">
        <Link
          href="https://discord.gg/EEpftCnkgv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center"
        >
          <Image src="/discord2.webp" alt="Discord" width={50} height={25} />
        </Link>

        <button onClick={() => { localStorage.removeItem(CLAIMED_ORDER_BROWSER_KEY); setClaimOpen(true); setClaimedOrderUrl(""); setClaimMessage(""); }} className="flex h-10 items-center justify-center whitespace-nowrap rounded-lg border-[3px] border-black bg-[#7eeb00] px-3 text-xs font-black text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#92ff14] sm:px-4 sm:text-sm">Claim Your Order</button>

        <div className="flex max-w-full items-center overflow-x-auto rounded-xl border-[3px] border-black bg-[#061b2f] p-1 shadow-[3px_3px_0_#000]">
          {[
  { label: "USD", flag: "https://flagcdn.com/w20/us.png" },
  { label: "PHP", flag: "https://flagcdn.com/w20/ph.png" },
  { label: "INR", flag: "https://flagcdn.com/w20/in.png" },
].map((currency) => (
  <button
    key={currency.label}
    onClick={() =>
      setCurrencyView(currency.label as "USD" | "PHP" | "INR")
    }
    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
      currencyView === currency.label
        ? "bg-[#7eeb00] text-black shadow-[2px_2px_0_#000]"
        : "text-slate-300 hover:bg-white/5"
    }`}
  >
    <img
      src={currency.flag}
      alt={currency.label}
      className="h-4 w-4 rounded-full"
    />

    {currency.label}
  </button>
))}
        </div>
        <CustomerAvatarMenu />
      </div>
    </div>
  </div>

  <div className="border-b-4 border-black bg-[#07345f]">
    <div className="relative flex flex-col gap-3 px-4 py-3 md:px-8 lg:h-[58px] lg:flex-row lg:items-center">
<div className="group relative hidden lg:block">
  <button className="flex items-center gap-3 px-2  py-2 transition hover:bg-white/5">
    <img
  src="/steal-an-egg-icon.PNG"
alt="Steal an Egg"
  className="h-10 w-10 rounded-lg border-2 border-black bg-white object-cover"
/>

<div className="flex items-center gap-2">
  <span className="text-2xl font-black tracking-tight text-white">
    Steal an Egg
  </span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate-400 transition group-hover:rotate-180 group-hover:text-blue-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
</div>
  </button>

  <div className="invisible absolute left-0 top-full z-50 mt-0.5 w-50 translate-y-2  border border-white/10 bg-[#0b1628]/80 p-3 opacity-0 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-700 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
    <div className="grid gap-2">
      {[
        { href: "/home", img: "/games/bloxfruits.png", alt: "Blox Fruits", name: "Blox Frtuis" },
    { href: "/grow-a-garden-2", img: "/games/grow-a-garden-2.png", alt: "Grow a Garden 2", name: "Grow a Garden 2" },
      ].map((shop) => (
        <Link
          key={shop.name}
          href={shop.href}
          className="flex items-center gap-3  border border-transparent px-3 py-2 transition-all duration-500 hover:border-white/5 hover:bg-white/5"
        >
          <img
            src={shop.img}
            alt={shop.alt}
            className="h-9 w-9 rounded-lg object-cover"
          />

          <span className="text-sm font-bold text-white">
            {shop.name}
          </span>
        </Link>
      ))}
    </div>
  </div>
</div>
       <div className="flex flex-wrap items-center justify-center gap-3 text-center text-sm font-black text-slate-300 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-md border-2 border-transparent px-3 py-1 transition duration-300 hover:border-black hover:bg-[#7eeb00] hover:text-black ${
              selectedCategory === category ? "border-black bg-[#7eeb00] text-black shadow-[2px_2px_0_#000]" : "text-cyan-50"
            }`}
          >
            {category}
            {index < categories.length - 1 && (
              <span className="ml-3 text-slate-500">|</span>
            )}
          </button>
        ))}
      </div>

      <div className="w-full lg:absolute lg:right-5 lg:w-auto">
       

         <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[1fr_220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border-[3px] border-black bg-white px-4 py-3 font-bold text-[#061b2f] shadow-[3px_3px_0_#000] outline-none placeholder:text-slate-500"
                  />

                  <div className="relative w-full lg:w-[230px]">
                    <button
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-xl border-[3px] border-black bg-[#7eeb00] px-4 py-3 text-sm font-black text-black shadow-[3px_3px_0_#000] transition-all duration-300 hover:bg-[#92ff14]"
                    >
                      <span>
                        {sortOption === "default" && "✨ Default"}
                        {sortOption === "price-low-high" && "💸 Price Low to High"}
                        {sortOption === "price-high-low" && "💎 Price High to Low"}
                        {sortOption === "name-a-z" && "🔤 Name A-Z"}
                        {sortOption === "name-z-a" && "🔠 Name Z-A"}
                      </span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-slate-400 transition ${
                          sortDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {sortDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#111827] shadow-[0_15px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        {[
                          { label: "✨ Default", value: "default" },
                          { label: "💸 Price Low to High", value: "price-low-high" },
                          { label: "💎 Price High to Low", value: "price-high-low" },
                          { label: "🔤 Name A-Z", value: "name-a-z" },
                          { label: "🔠 Name Z-A", value: "name-z-a" },
                        ].map((item) => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setSortOption(item.value);
                              setSortDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-blue-500/20 hover:text-white"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
      </div>
    </div>
  </div>
</div>

<div className="grid w-full max-w-none gap-2 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ProductFilterSidebar
            totalItems={visibleProducts.length}
            inStockItems={visibleProducts.filter((product) => !isUnavailable(product)).length}
            categories={categories.map((category) => ({
              name: category,
              count: category === "All"
                ? visibleProducts.length
                : visibleProducts.filter((product) => (product.category || "").trim() === category).length,
            }))}
            selectedCategory={selectedCategory}
            availabilityFilter={availabilityFilter}
            onCategoryChange={setSelectedCategory}
            onAvailabilityChange={setAvailabilityFilter}
            variant="steal-an-egg"
          />
          <main className="min-w-0 px-4 md:px-6 lg:px-8">
          <section className="p-2 md:p-4">
              {loadingProducts ? (
               <div className="grid auto-rows-fr grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                    <ProductSkeletonCard key={index} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 p-6 text-slate-300">
                  No products found for this filter or search.
                </div>
              ) : (
                <>
                  {currentPage === 1 && selectedCategory === "All" && !searchQuery.trim() ? (
                    <section className="relative mb-10 overflow-hidden border-4 border-black bg-[#031c52] shadow-[7px_7px_0_rgba(0,0,0,0.6)]">
                      <div data-luminous-layer="background" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_45%_42%,rgba(34,211,238,0.72),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.5),transparent_30%),linear-gradient(120deg,#064e8a_0%,#02a8c7_42%,#0753a1_68%,#03102f_100%)]" />
                      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 bg-[linear-gradient(135deg,transparent_0_45%,rgba(255,255,255,0.22)_50%,transparent_55%)]" />

                      <div data-luminous-layer="characters" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                        <img
                          src="/lumigreen.png"
                          alt=""
                          className="luminous-character-green absolute bottom-12 left-[-2%] h-[76%] w-[40%] object-contain object-left-bottom"
                        />
                        <img
                          src="/lumiblue.png"
                          alt=""
                          className="luminous-character-blue absolute bottom-12 left-[-2%] h-[76%] w-[40%] object-contain object-left-bottom"
                        />
                      </div>

                      <div data-luminous-layer="foreground" className="relative z-20 p-2 sm:p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="border-2 border-white bg-red-600 px-4 py-1 text-xl font-black text-white shadow-[3px_3px_0_#000] sm:text-3xl">
                              New!
                            </span>
                            <div>
                              <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[3px_3px_0_#000] sm:text-5xl lg:text-6xl">
                                Luminous Egg
                              </h2>
                              <p className="mt-1 text-lg font-black text-white drop-shadow-[2px_2px_0_#000] sm:text-3xl">
                                Limited Time!
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-black uppercase text-red-500 drop-shadow-[2px_2px_0_#000] sm:text-3xl">
                            {luminousCountdown}
                          </span>
                        </div>

                        <div className="mt-5 overflow-x-auto pb-2">
                          <div className="grid min-w-[760px] grid-cols-[72fr_80fr_88fr_98fr_108fr_122fr_142fr] items-end gap-3">
                            {[
                              { chance: "39%", image: "/39.png", images: null, accent: "border-black" },
                              { chance: "24%", image: "/24.png", images: null, accent: "border-black" },
                              { chance: "18%", image: "/18.png", images: null, accent: "border-black" },
                              { chance: "11%", image: "/11.png", images: null, accent: "border-black" },
                              { chance: "6.5%", image: "/6.5.png", images: null, accent: "border-black" },
                              { chance: "0.5%", image: "/0.5.png", images: null, accent: "border-amber-300" },
                              { chance: "1%", image: null, images: ["/1st-1-percent.png", "/2nd-1-percent.png", "/3rd-1-percent.png", "/4th-1-percent.png"], accent: "border-lime-300" },
                            ].map((slot, slotIndex) => (
                              <div
                                key={slot.chance}
                                className={`relative flex aspect-square items-center justify-center border-[3px] bg-[#04152d]/65 shadow-[3px_3px_0_rgba(0,0,0,0.75)] ${slot.accent}`}
                              >
                                <div className="absolute inset-1 border border-cyan-200/25" />
                                {slot.images ? (
                                  <div className="absolute inset-1 overflow-hidden">
                                    {slot.images.map((image, imageIndex) => (
                                      <img
                                        key={image}
                                        src={image}
                                        alt={`${slot.chance} Luminous Egg reward ${imageIndex + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                        className="luminous-one-percent-frame absolute inset-0 h-full w-full object-contain"
                                        style={{ animationDelay: `${imageIndex * 3}s` }}
                                      />
                                    ))}
                                  </div>
                                ) : slot.image ? (
                                  <img
                                    src={slot.image}
                                    alt={`${slot.chance} Luminous Egg reward`}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-1 h-[calc(100%_-_0.5rem)] w-[calc(100%_-_0.5rem)] object-contain"
                                  />
                                ) : (
                                  <div className="relative text-center">
                                    <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-cyan-100/70 text-sm font-black text-cyan-100 sm:h-11 sm:w-11">
                                      {slotIndex + 1}
                                    </span>
                                    <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-cyan-100/80 sm:text-xs">
                                      Empty
                                    </p>
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 z-10 text-sm font-black text-white drop-shadow-[2px_2px_0_#000] sm:text-lg">
                                  {slot.chance}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                          {[
                            { label: "50 Eggs", price: 13.99, comparePrice: 17.49 },
                            { label: "10 Eggs", price: 3.19, comparePrice: 3.99 },
                            { label: "3 Eggs", price: 0.99, comparePrice: 1.24 },
                            { label: "1 Egg", price: 0.39, comparePrice: 0.49 },
                          ].map((bundle) => {
                            const bundleProduct = products.find(
                              (product) => product.name.trim().toLowerCase() === bundle.label.toLowerCase()
                            );
                            const bundleUnavailable = !bundleProduct || isUnavailable(bundleProduct);

                            return (
                              <button
                                key={bundle.label}
                                type="button"
                                disabled={bundleUnavailable}
                                onClick={() => {
                                  if (!bundleProduct || bundleUnavailable) return;
                                  setAddingProductId(bundleProduct.id);
                                  setTimeout(() => {
                                    handleBuy(bundleProduct);
                                    setAddingProductId(null);
                                    setCartHit(true);
                                    setTimeout(() => setCartHit(false), 500);
                                  }, 500);
                                }}
                                className={`relative z-30 border-2 border-black px-3 py-2 text-center shadow-[3px_3px_0_#000] transition ${bundleUnavailable ? "cursor-not-allowed bg-lime-400/55 opacity-70" : "cursor-pointer bg-lime-400/90 hover:-translate-y-0.5 hover:bg-lime-300"}`}
                              >
                                <div className="flex items-baseline justify-center gap-1.5 text-black">
                                  <span className="text-lg font-black">{formatMoney(bundle.price)}</span>
                                  <span className="text-xs font-bold text-red-700 line-through">
                                    {formatMoney(bundle.comparePrice)}
                                  </span>
                                </div>
                                <p className="text-xs font-black text-black sm:text-sm">
                                  {addingProductId === bundleProduct?.id ? "Adding..." : bundle.label}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  ) : null}
                  <div className="grid auto-rows-fr grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                    {paginatedProducts.map((product, productIndex) => {
                      const stockLabel = getStockLabel(product);
                      const outOfStock = isUnavailable(product);
                      const quantity = Number(product.stock_quantity ?? 0);
                      const discountPercent = getDiscountPercent(product);
                      const unavailableReason = getUnavailableReason(product);

                      const usesStealAnEggCard = product.game === "steal-an-egg";

                      if (usesStealAnEggCard) {
                        return (
                          <div
                            id={(product.slug || product.name).toLowerCase().replace(/\s+/g, "-")}
                            key={product.id}
                            className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border-4 border-black bg-[#7eeb00] shadow-[7px_7px_0_#000] transition-transform duration-300 hover:-translate-y-1"
                          >
                            <PageTransitionLink
                              href={`/products/${encodeURIComponent(product.slug || String(product.id))}`}
                              ariaLabel={`View ${product.name}`}
                              className="absolute inset-0 z-10"
                            />

                            <div className="relative aspect-square w-full shrink-0 overflow-hidden border-b-4 border-black bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-800">
                              <div className="pointer-events-none absolute inset-2 rounded-[18%] border-4 border-cyan-200/90" />
                              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.5),transparent_38%)]" />
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  loading={productIndex < 12 ? "eager" : "lazy"}
                                  decoding="async"
                                  alt={product.name}
                                  className="relative z-[1] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                              ) : (
                                <div className="relative z-[1] h-28 w-28 rounded-full bg-gradient-to-br from-white via-cyan-200 to-blue-700 shadow-[0_0_45px_rgba(255,255,255,0.7)]" />
                              )}
                            </div>

                            <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center border-t-0 bg-gradient-to-b from-[#eaffd0] to-[#7eeb00] px-3 py-2 text-center text-black">
                              <h3 className="w-full truncate font-serif text-base leading-tight text-black sm:text-lg">
                                {product.name}
                              </h3>

                              <button
                                onClick={() => {
                                  if (outOfStock) return;
                                  setAddingProductId(product.id);
                                  setTimeout(() => {
                                    handleBuy(product);
                                    setAddingProductId(null);
                                    setCartHit(true);
                                    setTimeout(() => setCartHit(false), 500);
                                  }, 500);
                                }}
                                disabled={outOfStock}
                                className={`relative z-20 mt-auto flex h-10 w-[84%] items-center justify-center rounded-lg border-[3px] border-black bg-white shadow-[3px_3px_0_#000] px-3 font-serif text-base text-black transition [&_p]:!text-base [&_p]:!font-bold [&_p]:!text-black sm:text-lg sm:[&_p]:!text-lg ${outOfStock ? "cursor-not-allowed opacity-50" : addingProductId === product.id ? "cursor-wait bg-slate-200" : "cursor-pointer hover:bg-slate-100"}`}
                              >
                                {outOfStock ? (
                                  "UNAVAILABLE"
                                ) : addingProductId === product.id ? (
                                  "ADDING..."
                                ) : (
                                  <span className="flex items-center justify-center gap-1.5 whitespace-nowrap font-bold">
                                    <span>{formatMoney(Number(product.price))}</span>
                                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) ? (
                                      <>
                                        <span className="text-slate-500">/</span>
                                        <span className="text-sm text-slate-500 line-through">
                                          {formatMoney(Number(product.compare_at_price))}
                                        </span>
                                      </>
                                    ) : null}
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div
  id={(product.slug || product.name)
    .toLowerCase()
    .replace(/\s+/g, "-")}
  key={product.id}
  style={{
    animationDelay: `${(product.id % 15) * 30}ms`,
  }}
                         className={`scroll-mt-40 group relative flex w-full min-w-0 aspect-[3/4] animate-[productAppear_.45s_ease-out] flex-col overflow-hidden rounded-2xl border bg-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-slate-500/80 border-slate-600/60`}
                        >
                          <PageTransitionLink
                            href={`/products/${encodeURIComponent(product.slug || String(product.id))}`}
                            ariaLabel={`View ${product.name}`}
                            className="absolute inset-0 z-10"
                          />
                          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                            <div className="absolute -left-24 top-16 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -right-24 bottom-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,0.07)_45%,transparent_65%)] translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000" />
                          </div>

                          <div className="relative h-[42%] min-h-[125px] shrink-0 overflow-hidden border-b border-slate-700/70 bg-gradient-to-br from-emerald-500/20 via-[#07111f] to-blue-700/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_right,rgba(37,99,235,0.20),transparent_40%)]" />

                            {discountPercent ? (
                              <div className="absolute left-0 top-0 z-20 h-32 w-32 overflow-hidden">
                              
                              </div>
                            ) : null}

                            <span
                              className={`absolute right-4 top-4 z-20 rounded-full px-3 py-1 text-xs font-bold ${
                                outOfStock
                                  ? "bg-red-500/15 text-red-300"
                                  : stockLabel === "Limited"
                                  ? "bg-yellow-500/15 text-yellow-300"
                                  : "bg-emerald-500/15 text-emerald-300"
                              }`}
                            >
                              {outOfStock ? unavailableReason : stockLabel === "Limited" && quantity > 0 ? `Low Stock · ${quantity} left` : stockLabel}
                            </span>

                            <div className="relative z-10 flex h-full items-center justify-center p-5">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  loading={productIndex < 12 ? "eager" : "lazy"}
                                  decoding="async"
                                  alt={product.name}
                                  className="h-[78%] w-[78%] max-h-[170px] max-w-[170px] object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-sky-300 shadow-[0_0_60px_rgba(59,130,246,0.20)]" />
                              )}
                            </div>
                          </div>

                          <div className="flex min-h-0 flex-1 flex-col bg-[#07111f] p-3">
                            <h3 className="shrink-0 truncate text-base font-black text-white">
                              {product.name}
                            </h3>

                            <p className="mt-0.5 shrink-0 text-xs font-semibold text-blue-400">
                              {product.category || "General"}
                            </p>
                            {!outOfStock && quantity > 0 && quantity <= 3 ? (
                              <p className="mt-2 shrink-0 text-xs font-bold text-yellow-300">
                                Only {quantity} left - running low
                              </p>
                            ) : outOfStock ? (
                              <p className="mt-2 shrink-0 text-xs font-semibold text-red-300">
                                {unavailableReason}
                              </p>
                            ) : null}

                          
  <div className="mt-2 flex shrink-0 items-baseline gap-2">
    {renderPrice(product)}

    {product.compare_at_price &&
      Number(product.compare_at_price) > Number(product.price) && (
        <span className="relative inline-block text-xs font-semibold text-slate-500 after:absolute after:left-[-0.1em] after:top-1/2 after:h-px after:w-[calc(100%+0.2em)] after:-rotate-12 after:bg-rose-400/90">
          {formatMoney(Number(product.compare_at_price))}
        </span>
      )}
  </div>

                            
                             <button
  onClick={() => {
  if (isUnavailable(product)) return;

  setAddingProductId(product.id);

  setTimeout(() => {
    handleBuy(product);
    setAddingProductId(null);
    setCartHit(true);

    setTimeout(() => {
      setCartHit(false);
    }, 500);
  }, 500);
}}
  className={`relative z-20 mt-auto mb-1 flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-0 text-[11px] font-bold transition ${
    outOfStock
      ? "cursor-not-allowed bg-slate-700 text-slate-300"
      : addingProductId === product.id
	? "cursor-wait bg-blue-400 text-white"
	: "cursor-pointer border-2 border-black bg-[#7eeb00] text-black shadow-[2px_2px_0_#000] hover:bg-blue-400"
  }`}
  disabled={outOfStock}
>
  {!outOfStock && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0z"
      />
    </svg>
  )}

  {outOfStock ? (
  "Unavailable"
) : addingProductId === product.id ? (
  <div className="flex items-center gap-2">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    <span>Adding...</span>
  </div>
) : (
  "Add to Cart"
)}

</button>
                          
                          </div>
                        </div>
                      );
                    })}
                  </div>


                </>
              )}
            </section>
	                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`h-8 rounded-lg px-3 text-xs font-bold transition-all duration-300 ease-out ${
                        currentPage === 1
                          ? "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "border border-slate-700/60 bg-[#10213a]/70 text-white hover:bg-[#142846]/80 hover:border-blue-400/30"
                      }`}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg p-0 text-xs font-bold transition ${
                            currentPage === pageNumber
                              ? "border-2 border-black bg-[#7eeb00] text-black shadow-[2px_2px_0_#000]"
                              : "border-2 border-black bg-white text-black hover:bg-[#dfffb8]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`h-8 rounded-lg px-3 text-xs font-bold transition ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "border-2 border-black bg-white text-black hover:bg-[#dfffb8]"
                      }`}
                    >
                      Next
                    </button>
                  </div>
          </main>
        </div>
      </div>
      <>
<section className="relative mt-16 w-full overflow-hidden border-t border-white/10 bg-[#07111f] md:mt-24">

  <img
    src="/steal-an-egg-logo.png"
    alt="Steal an Egg Shop"
   className="h-[180px] w-full object-cover object-center md:h-[320px]"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/50 to-transparent" />

  <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
    


    <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-200 md:text-lg">
     
      Bloxhop is an independent digital marketplace and is not affiliated,
      associated, authorized, endorsed by, or officially connected with Roblox
      Corporation, Blox Fruits, Gamer Robot Inc., or any respective game
      developers, publishers, or trademark holders. All game titles, names,
      trademarks, and assets remain the property of their respective owners.
    </p>
 

  </div>
</section>
        <div
          onClick={() => setIsCartOpen(false)}
          className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 ${

            isCartOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />

        <div
         className={`fixed right-4 top-[165px] z-[80] flex h-[calc(100vh-185px)] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020]/95 shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-500 ease-in-out ${

	
           isCartOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
          }`}
        >
          <div className="border-b border-slate-700/60 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black">Your Cart</h3>
                <p className="text-sm text-slate-400">Review your items before checkout</p>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-[#142846]/80 px-4 py-2 text-sm font-semibold hover:bg-[#1b3558]/80"
              >
                Close
              </button>
            </div>

            
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-pink-400/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 shadow-[0_0_45px_rgba(236,72,153,0.18)]">
    
    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.25),transparent_55%)]" />

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 h-12 w-12 text-pink-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  </div>

  <h3 className="mt-6 text-2xl font-black text-white">
    Your cart is empty
  </h3>

  <p className="mt-3 max-w-[260px] text-sm leading-7 text-slate-400">
    Add products to your cart to continue to secure checkout.
  </p>
</div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
  key={item.id}
  className="rounded-2xl bg-[#17172f]/95 p-3"
>
  <div className="flex items-center gap-3">
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0b1628]/80">
      {item.image_url ? (
        <img
          src={item.image_url}
          loading="lazy"
          decoding="async"
          alt={item.name}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-blue-500/20" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <h4 className="truncate text-sm font-black text-white">
        {item.name}
      </h4>

      

      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm font-black text-emerald-300">
          {formatMoney(Number(item.price))}
        </span>

        {item.compare_at_price &&
          Number(item.compare_at_price) > Number(item.price) && (
            <span className="text-xs font-bold text-slate-500 line-through">
              {formatMoney(Number(item.compare_at_price))}
            </span>
          )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => decreaseQuantity(item.id)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#252545] text-sm font-black text-slate-300 hover:bg-[#30305a]"
      >
        -
      </button>

      <span className="min-w-[22px] rounded-md bg-[#2b2b4c] px-2 py-1 text-center text-sm font-black text-white">
        {item.quantity}
      </span>

      <button
        onClick={() => increaseQuantity(item.id)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#252545] text-sm font-black text-slate-300 hover:bg-[#30305a]"
      >
        +
      </button>
    </div>
  </div>

  <div className="mt-3 flex items-center justify-between">
    <p className="text-sm font-black text-sky-300">
      {formatMoney(Number(item.price) * item.quantity)}
    </p>

  
  </div>
</div>
                  
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-700/60 p-6">
            <div className="mb-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Review your selected products and service details before checkout.
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-sky-300">
  		{formatMoney(totalPrice)}
		</span>
            </div>
	{currencyView !== "PHP" && usdToPhpRate ? (
  <div className="mt-1 flex items-center justify-between text-sm">
    <span className="text-slate-400">Est. PHP at checkout</span>
    <span className="font-bold text-emerald-300">
      ₱
      {(totalPrice * usdToPhpRate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  </div>
) : null}

           
            <div className="mt-4">
<Link
                href="/steal-an-egg/checkout"
                className={`flex h-10 w-full items-center justify-center whitespace-nowrap rounded-xl px-3 text-sm font-bold transition ${
                  cartItems.length === 0
                    ? "pointer-events-none bg-slate-700 text-slate-300"
                    : "border-2 border-black bg-[#7eeb00] text-black shadow-[2px_2px_0_#000] hover:bg-blue-400"
                }`}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          disabled={isCartOpen}
          className={`fixed top-50 right-15 z-50 flex items-center justify-center transition-all duration-500 ease-in-out hover:scale-110 ${
  cartHit
    ? "scale-125 ring-4 ring-blue-300 shadow-[0_0_70px_rgba(59,130,246,0.95)]"
    : ""
} ${
 cartItems.length > 0 && !isCartOpen
  ? "animate-bounce ring-cyan-400/40"
  : ""
} ${

		
            isCartOpen
              ? "translate-x-10 -translate-y-1/2 opacity-40 scale-90"
              : "translate-x-7 -translate-y-1/2 opacity-100 scale-100"
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/30 bg-[#0b1628] text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.18)] transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:text-white ${
  cartItems.length > 0 && !isCartOpen
  ? "border-2 border-black bg-[#7eeb00] text-black shadow-[2px_2px_0_#000] shadow-[0_0_35px_rgba(59,130,246,0.55)]"
  : ""
}`}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
</div>

          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-red-500 text-xs font-black text-white">
              {cartCount}
            </span>
          )}
        </button>
{cartItems.length > 0 && !isCartOpen && (
  <button
    onClick={() => setIsCartOpen(true)}
    className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-[premiumFloat_3.5s_ease-in-out_infinite] items-center gap-4 overflow-hidden rounded-2xl border-[4px] border-black bg-gradient-to-r from-[#7eeb00] to-[#09bcd4] px-7 py-4 text-black shadow-[7px_7px_0_#000] transition-all duration-300 hover:scale-105">
	<div className="absolute inset-0 overflow-hidden rounded-[2rem]">
  <div className="absolute -left-[50%] top-0 h-full w-[500%] rotate-5 bg-gradient-to-r from-transparent via-pink-700/40 to-transparent blur-xl animate-[shine_5.5s_linear_infinite]" />
</div>

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.30),transparent_40%)]" />
	
	

    <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-orange-500/30 blur-3xl" />
    <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" />

    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-300/20 bg-white/10 text-pink-200 shadow-[0_0_30px_rgba(236,72,153,0.45)]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.3}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>

    <div className="relative text-left">
     

      <p className="mt-1 text-xl font-black text-white">
        View Cart
      </p>
    </div>
	
    <div className="relative ml-2 flex h-11 min-w-[44px] items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 px-3 text-sm font-black text-white shadow-[0_0_30px_rgba(236,72,153,0.65)]">
      {cartCount}
    </div>
  </button>
)}
{flyingCardProduct && (
  <div className="pointer-events-none fixed inset-0 z-[160] flex items-center justify-center">
    <div className="animate-[vacuumCard_.9s_ease-in-out_forwards] w-[420px] overflow-hidden rounded-[2rem] border border-blue-300/30 bg-gradient-to-br from-[#081225] via-[#0b1730] to-[#06101d] p-4">
      <div className="flex h-[230px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-500/20 via-[#07111f] to-cyan-400/10 p-5">
        {flyingCardProduct.image_url && (
          <img
            src={flyingCardProduct.image_url}
            loading="lazy"
            decoding="async"
            alt={flyingCardProduct.name}
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <h3 className="mt-4 text-2xl font-black text-white">
        {flyingCardProduct.name}
      </h3>

      <p className="mt-1 text-sm font-bold text-blue-300">
        {flyingCardProduct.category || "General"}
      </p>
    </div>
  </div>
)}
{popupProduct && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
    <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-blue-300/30 bg-gradient-to-br from-[#081225] via-[#0b1730] to-[#06101d] p-1">
      <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,0.09)_45%,transparent_65%)]" />

      <div className="relative rounded-[2.3rem] border border-white/10 bg-[#07111f]/90 p-6">
        <button
          onClick={() => setPopupProduct(null)}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-black text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        <div className="mb-4 inline-flex rounded-full border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-200">
         HOT
        </div>

      <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-[2rem] border border-blue-300/20 bg-gradient-to-br from-blue-500/20 via-[#07111f] to-cyan-400/10 p-6 shadow-inner shadow-[0_0_60px_rgba(59,130,246,0.25)]">
          <div className="absolute h-44 w-44 rounded-full bg-blue-1000/10 blur-3xl" />
<div className="absolute inset-0 overflow-hidden">
  <div className="absolute -left-[50%] top-0 h-full w-[700%] rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-2xl animate-[shineMove_5s_linear_infinite]" />
</div>
          {popupProduct.image_url ? (
         <img
  src={popupProduct.image_url}
  loading="lazy"
  decoding="async"
  alt={popupProduct.name}
  className="relative z-10 h-full w-full animate-[premiumFloat_4s_ease-in-out_infinite] object-contain drop-shadow-[0_0_45px_rgba(96,165,250,0.55)] transition duration-500 "
/>
          ) : null}
        </div>

        <div className="mt-6">
          <h2 className="text-4xl font-black leading-tight text-white">
            {popupProduct.name}
          </h2>

          <p className="mt-2 text-sm font-bold text-blue-300">
            {popupProduct.category || "General"}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Featured Price
            </p>

            <div className="mt-2">{renderPrice(popupProduct)}</div>
          </div>

          <button
        onClick={() => {
  if (isUnavailable(popupProduct)) return;

  const productToAdd = popupProduct;

  setFlyingCardProduct(productToAdd);
  setPopupProduct(null);

  setTimeout(() => {
    handleBuy(productToAdd);
    setCartHit(true);
  }, 700);

  setTimeout(() => {
    setFlyingCardProduct(null);
    setCartHit(false);
  }, 800);
}}
            disabled={isUnavailable(popupProduct)}
            className={`mt-5 flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-black transition ${
              isUnavailable(popupProduct)
                ? "cursor-not-allowed bg-slate-700 text-slate-300"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_45px_rgba(59,130,246,0.55)] hover:scale-[1.02]"
            }`}
          >
            {isUnavailable(popupProduct) ? "Unavailable" : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        {claimOpen && (
          <div className="fixed inset-0 z-[220] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Claim your Steal an Egg order">
            <div className={`relative my-auto w-full overflow-hidden ${claimedOrderUrl ? "max-w-6xl bg-transparent" : "max-w-xl rounded-2xl border-[4px] border-black bg-gradient-to-b from-[#09bcd4] to-[#08699a] p-1 shadow-[10px_10px_0_#000]"}`}> 
              {!claimedOrderUrl && <button onClick={() => { setClaimOpen(false); setClaimedOrderUrl(""); }} aria-label="Close claim order" className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-black bg-white text-lg font-black text-black shadow-[3px_3px_0_#000]">✕</button>}
              {claimedOrderUrl ? (
                <iframe src={claimedOrderUrl} title="Steal an Egg delivery instructions" scrolling="no" style={{ height: claimFrameHeight }} onLoad={(event) => { const doc=event.currentTarget.contentDocument; if(!doc)return; let cardObserver:ResizeObserver|null=null; const measure=()=>{const card=doc.querySelector("[data-embedded-order-card]") as HTMLElement|null; if(!card)return; setClaimFrameHeight(Math.max(320,Math.ceil(card.getBoundingClientRect().height))); if(!cardObserver){cardObserver=new ResizeObserver(measure);cardObserver.observe(card);}}; measure(); const mutationObserver=new MutationObserver(measure); mutationObserver.observe(doc.documentElement,{childList:true,subtree:true}); window.setTimeout(measure,250); window.setTimeout(measure,1000); }} className="block w-full bg-transparent" />
              ) : (
                <div className="rounded-xl border-2 border-black bg-[#061b2f]/95 p-6 sm:p-9">
                  <img src="/steal-an-egg-logo.png" alt="Steal an Egg" className="mx-auto h-20 w-auto max-w-full object-contain" />
                  <p className="mt-5 text-center text-xs font-black uppercase tracking-[.22em] text-[#7eeb00]">Secure order access</p>
                  <h2 className="mt-2 text-center text-3xl font-black text-white [text-shadow:2px_2px_0_#000]">Claim Your Order</h2>
                  <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-cyan-50">Enter your order number. On the same browser used for payment, email is optional. Otherwise, enter the payment email for secure verification.</p>
                  <form onSubmit={(event) => { event.preventDefault(); claimOrder(); }} className="mt-7 space-y-4">
                    <label className="block"><span className="text-sm font-black text-white">Order number</span><input inputMode="numeric" autoComplete="off" value={claimOrderId} onChange={(event)=>setClaimOrderId(event.target.value.replace(/\D/g,""))} placeholder="Example: 306" required className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-3 font-bold text-[#07111f] outline-none focus:ring-4 focus:ring-cyan-300/30" /></label>
                    <label className="block"><span className="text-sm font-black text-white">Payment email <span className="font-semibold text-cyan-200">(optional on the same browser)</span></span><input type="email" autoComplete="email" value={claimEmail} onChange={(event)=>setClaimEmail(event.target.value)} placeholder="Email used with PayMongo or PayPal" className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-3 font-bold text-[#07111f] outline-none focus:ring-4 focus:ring-cyan-300/30" /></label>
                    <button disabled={claimLoading || !claimOrderId} className="flex min-h-14 w-full items-center justify-center rounded-xl border-[3px] border-black bg-[#7eeb00] px-5 py-3 text-lg font-black text-black shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#92ff14] disabled:cursor-not-allowed disabled:opacity-50">{claimLoading ? "Verifying order…" : "Open My Instructions"}</button>
                  </form>
                  {claimMessage && <p className="mt-5 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-center text-sm font-bold text-red-700">{claimMessage}</p>}
                </div>
              )}
            </div>
          </div>
        )}        <DeferredProductRealtime onChange={loadProducts} />
        <CheckoutPrefetch enabled={cartItems.length > 0} />
        {!isCartOpen && <LazySupportChat />}
      </>
    </div>
  );
}


