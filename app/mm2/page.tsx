"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import TrustBadges from "@/components/TrustBadges";
import SupportChat from "@/components/SupportChat";
import SaleBot from "@/components/SaleBot";


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

type CartItem = Product & {
  quantity: number;
};

function ProductSkeletonCard() {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[#0b1628]/70 backdrop-blur-md p-4 shadow-[0_12px_35px_rgba(2,6,23,0.28)]">
      <div className="skeleton h-72 w-full rounded-[1.5rem]" />

      <div className="mt-5 space-y-3">
        <div className="skeleton h-6 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-1/3 rounded-xl" />
        <div className="skeleton h-4 w-full rounded-xl" />
        <div className="skeleton h-4 w-5/6 rounded-xl" />

        <div className="pt-2 space-y-2">
          <div className="skeleton h-8 w-28 rounded-xl" />
          <div className="skeleton h-4 w-24 rounded-xl" />
        </div>

        <div className="pt-2">
          <div className="skeleton h-12 w-full rounded-2xl" />
        </div>
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState(
    "Shop safely with secure checkout, fast digital delivery, order tracking, and active Discord community support."
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [currencyView, setCurrencyView] = useState<"USD" | "PHP" | "INR">("USD");
  const [usdToPhpRate, setUsdToPhpRate] = useState<number | null>(null);
  const [usdToInrRate, setUsdToInrRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [flyingCardProduct, setFlyingCardProduct] = useState<Product | null>(null);
  const [cartHit, setCartHit] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  // NEW: capital amount available for fulfilling orders.
  // Products still show, but if capital is lower than the product price, Add to Cart becomes unavailable.
  const [availableCapital, setAvailableCapital] = useState<number | null>(null);


  const PRODUCTS_PER_PAGE = 18;

useEffect(() => {
  setMounted(true);
}, []);

   useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("real-cart", JSON.stringify(cartItems));
  }, [cartItems]);

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

  // NEW: Load current capital from your backend.
  // Make sure you have /api/capital returning { capital: number }.
  useEffect(() => {
    async function loadCapital() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error || "Failed to load capital.");
          return;
        }

        setAvailableCapital(Number(data.global_capital || 0));
      } catch (error) {
        console.error("Capital fetch failed:", error);
      }
    }

    loadCapital();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortOption]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);

      const response = await fetch("/api/products", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to load products.");
        return;
      }

    const mm2Products = (result.products || []).filter(
  (product: Product) => product.game === "mm2"
);

setProducts(mm2Products);


    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while loading products.");
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

    if (product.is_active === false) return "Currently unavailable";
    if (quantity <= 0 || product.stock === "Out of Stock") return "Out of stock";
    if (isCapitalUnavailable(product)) return "Currently unavailable";

    return "Unavailable";
  }

  function getDiscountPercent(product: Product) {
    const compareAt = Number(product.compare_at_price ?? 0);
    const current = Number(product.price ?? 0);

    if (!compareAt || compareAt <= current) return null;

    return Math.round(((compareAt - current) / compareAt) * 100);
  }

  function getSavingsAmount(product: Product) {
    const compareAt = Number(product.compare_at_price ?? 0);
    const current = Number(product.price ?? 0);

    if (!compareAt || compareAt <= current) return null;

    return compareAt - current;
  }

  function handleBuy(product: Product) {
    if (isUnavailable(product)) {
      setMessage(`${product.name} is currently unavailable.`);
      return;
    }

    const existingItem = cartItems.find((item) => item.id === product.id);
    const availableStock = Number(product.stock_quantity ?? 0);

    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        setMessage(`Max stock reached for ${product.name}.`);
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

    setMessage(`${product.name} added to cart.`);
    
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
    setMessage("Item removed from cart.");
  }

  function clearCart() {
    setCartItems([]);
    setMessage("Cart cleared.");
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
        <p className="text-2xl font-extrabold text-emerald-300">
          ${usd.toFixed(2)}
        </p>
      );
    }

    if (currencyView === "PHP") {
      return (
        <p className="text-2xl font-extrabold text-emerald-300">
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
       <p className="text-2xl font-extrabold text-emerald-300">
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
        <p className="text-2xl font-extrabold text-emerald-300">
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

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => product.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
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

      return matchesCategory && matchesSearch;
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
  }, [products, selectedCategory, searchQuery, sortOption]);

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

      setHighlightedProductId(id);
 const foundProduct = products.find(
  (product) =>
    (product.slug || product.name).toLowerCase().replace(/\s+/g, "-") === id
);

if (foundProduct) {
  setPopupProduct(foundProduct);
}

      setTimeout(() => {
        setHighlightedProductId(null);
      }, 2500);
    }
  }, 300);
}, [loadingProducts, paginatedProducts]);


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="relative min-h-screen bg-[#07111f] text-white">
     <SaleBot />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_30%)]" />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-[12%] h-72 w-72 animate-[orbFloat_9s_ease-in-out_infinite] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute right-[8%] top-[18%] h-96 w-96 animate-[orbFloat_12s_ease-in-out_infinite] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[12%] left-[18%] h-80 w-80 animate-[orbFloat_11s_ease-in-out_infinite] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_12%_22%,rgba(255,255,255,0.24)_0_1px,transparent_2px),radial-gradient(circle_at_32%_70%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_74%_35%,rgba(255,255,255,0.20)_0_1px,transparent_2px),radial-gradient(circle_at_88%_78%,rgba(255,255,255,0.14)_0_1px,transparent_2px)] animate-[starDrift_18s_linear_infinite]" />
      </div>

     <div className="relative w-full px-0">
    
<div className="sticky top-0 z-50 mb-6">
  <div className="overflow-hidden border-b border-blue-500/10 bg-[#07111f]/95 shadow-[0_15px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
    <div className="absolute inset-0 hidden md:block">
      <img
        src="/mm2-logo.png"
        alt="Background"
        className="h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/80 via-[#07111f]/45 to-[#07111f]/80" />
    </div>

   <div className="relative mx-auto flex max-w-[1850px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
    <Link
  href="/"
  className="flex items-center gap-4 pl-3 transition hover:opacity-90"
>

  <img
    src="/logo.png"
    alt="Bloxhop"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className="text-base font-black leading-none tracking-tight text-white sm:text-xl">
      BLOXHOP ONLINE STORE
    </h1>

    <p className="mt-1 text-xs text-slate-300">
      Fast & Reliable Gaming Services
    </p>
  </div>
</Link>

    <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:justify-end">
        <Link
          href="https://discord.gg/EEpftCnkgv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center"
        >
          <Image src="/discord2.png" alt="Discord" width={50} height={25} />
        </Link>

        <div className="flex max-w-full items-center overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1628]/80 p-1 backdrop-blur-xl">
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
        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_10px_35px_rgba(59,130,246,0.35)]"
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
      </div>
    </div>
  </div>

  <div className="border-b border-blue-500/10 bg-[#081220]/20 backdrop-blur-xl">
    <div className="relative flex flex-col gap-3 px-4 py-3 md:px-8 lg:h-[58px] lg:flex-row lg:items-center">
<div className="group relative hidden lg:block">
  <button className="flex items-center gap-3 px-2  py-2 transition hover:bg-white/5">
    <img
  src="/games/mm2.png"
  alt="MM2"
  className="h-10 w-10 rounded-xl object-cover"
/>

<div className="flex items-center gap-2">
  <span className="text-2xl font-black tracking-tight text-white">
    MM2
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
        { href: "/adopt-me", img: "/games/adoptme.png", alt: "Adopt Me", name: "Adopt Me" },
        { href: "/pet-simulator", img: "/games/petsim.png", alt: "Pet Simulator", name: "Pet Simulator" },
        { href: "/blade-ball", img: "/games/bladeball.png", alt: "Blade Ball", name: "Blade Ball" },
        { href: "/anime-defenders", img: "/games/animedefender.png", alt: "Anime Defender", name: "Anime Defender" },
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
            className={`transition duration-300 hover:text-white hover:drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] ${
              selectedCategory === category ? "underline text-white" : "text-slate-400"
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
                    className="w-full rounded-2xl border border-slate-700/60 bg-[#0b1628] px-4 py-3 outline-none placeholder:text-slate-500"
                  />

                  <div className="relative w-full lg:w-[230px]">
                    <button
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#111827]/95 px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:border-blue-400/20 hover:bg-[#172033]"
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

<div className="mx-auto max-w-[1850px] px-4 md:px-6 lg:px-8">
          <main className="min-w-0">
          <section className="min-h-[1400px] xl:min-h-[1750px] p-2 md:p-4">
		
              

              <div className="relative mb-5 flex items-center justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
  <div className="text-sm text-sky-100">
    {message}
  </div>

  <div className="hidden items-center gap-3 md:flex">
    <div className="rounded-2xl border border-pink-400/20 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-pink-200 shadow-[0_0_25px_rgba(236,72,153,0.18)]">
      ⚡ Fast Delivery
    </div>

    <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.18)]">
      🛡 Secure Checkout
    </div>
  </div>
</div>

              {loadingProducts ? (
               <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
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
                  <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                    {paginatedProducts.map((product) => {
                      const stockLabel = getStockLabel(product);
                      const outOfStock = isUnavailable(product);
                      const quantity = Number(product.stock_quantity ?? 0);
                      const discountPercent = getDiscountPercent(product);
                      const savingsAmount = getSavingsAmount(product);
                      const unavailableReason = getUnavailableReason(product);

                      return (
                        <div
  id={(product.slug || product.name)
    .toLowerCase()
    .replace(/\s+/g, "-")}
  key={product.id}
  style={{
    animationDelay: `${(product.id % 15) * 30}ms`,
  }}
                         className={`scroll-mt-40 group relative flex min-h-[470px] animate-[productAppear_.45s_ease-out] flex-col overflow-hidden rounded-[2rem] border bg-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-pink-400/35 hover:shadow-[0_25px_80px_rgba(236,72,153,0.20)] ${
  highlightedProductId ===
  (product.slug || product.name).toLowerCase().replace(/\s+/g, "-")
    ? "z-40 scale-110 border-blue-300 shadow-[0_0_90px_rgba(59,130,246,0.75)]"
    : "border-slate-600/60"
}`}
                        >
                          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                            <div className="absolute -left-24 top-16 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -right-24 bottom-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,0.07)_45%,transparent_65%)] translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000" />
                          </div>

                          <div className="relative h-[230px] overflow-hidden border-b border-slate-700/70 bg-gradient-to-br from-emerald-500/20 via-[#07111f] to-blue-700/20">
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
                              {outOfStock ? unavailableReason : stockLabel}
                            </span>

                            <div className="relative z-10 flex h-full items-center justify-center p-5">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-[205px] w-[205px] object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-sky-300 shadow-[0_0_60px_rgba(59,130,246,0.20)]" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col bg-[#07111f] p-5">
                            <h3 className="truncate text-xl font-black text-white">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-blue-400">
                              {product.category || "General"}
                            </p>

                            <div className="mt-4">
                              {!outOfStock && quantity > 0 ? (
                                <div className="space-y-1">
                                  {quantity <= 3 && (
                                    <p className="text-sm font-bold text-yellow-300">
                                      Only a few left — high demand
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-red-300">
                                  {unavailableReason}
                                </p>
                              )}
                            </div>

                          
  <div className="flex items-center justify-between gap-3">
    <div>
      {renderPrice(product)}

      {product.compare_at_price &&
        Number(product.compare_at_price) > Number(product.price) && (
          <p className="mt-1 text-sm font-bold text-slate-500 line-through decoration-slate-400">
            {formatMoney(Number(product.compare_at_price))}
          </p>
        )}
    </div>

    {savingsAmount && (
      <span className="flex h-[40px] w-[100px] items-center justify-center rounded-xl bg-emerald-500/20 px-2 text-center text-xs font-black leading-tight text-emerald-300">
        {currencyView === "USD" && `Save $${savingsAmount.toFixed(2)}`}
        {currencyView === "PHP" && usdToPhpRate &&
          `Save ₱${(savingsAmount * usdToPhpRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        {currencyView === "INR" && usdToInrRate &&
          `Save ₹${(savingsAmount * usdToInrRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
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
  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-bold transition ${
    outOfStock
      ? "cursor-not-allowed bg-slate-700 text-slate-300"
      : addingProductId === product.id
	? "cursor-wait bg-blue-400 text-white"
	: "cursor-pointer bg-blue-500 text-white hover:bg-blue-400"
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
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-300 ease-out ${
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
                          className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                            currentPage === pageNumber
                              ? "bg-blue-500 text-white"
                              : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
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
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
                      }`}
                    >
                      Next
                    </button>
                  </div>
          </main>



          <section className="mx-auto mt-20 max-w-5xl px-4 pb-24 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
              Bloxhop Online Store
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
              Fast, simple, and organized digital gaming services.
            </h2>

            <p className="mt-6 text-sm leading-8 text-slate-400 md:text-base">
              Bloxhop is built to make digital product browsing easier with clear product cards,
              category filters, order review, checkout flow, and customer support. Our goal is to
              keep the shopping experience clean, transparent, and easy to understand before you
              place an order.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-[#0f1b2d]/45 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-black text-white">Secure Flow</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Product details, order review, and checkout steps are organized clearly.
                </p>
              </div>

              <div className="rounded-3xl bg-[#0f1b2d]/45 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-black text-white">Digital Fulfillment</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Orders are reviewed and fulfilled digitally after confirmation.
                </p>
              </div>

              <div className="rounded-3xl bg-[#0f1b2d]/45 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-black text-white">Customer Support</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Support is available for order questions, delivery concerns, and updates.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
<section className="mx-auto mt-24 max-w-7xl px-4 pb-28">
  <div className="mb-10 text-center">
    <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">
      Help Center
    </p>

    <h2 className="mt-4 text-4xl font-black text-white">
      Questions Before You Order?
    </h2>

    <p className="mt-4 text-slate-400">
      Quick answers about checkout, delivery, support, and order safety.
    </p>
  </div>

  <div className="mx-auto grid max-w-4xl gap-4">
    {[
      {
        q: "How does Bloxhop's Blox Fruits delivery work?",
        a: "Bloxhop's order process is designed to be simple and organized:\n\nSelect your preferred products from the store and review your cart before checkout.\n\nEnter and verify your Roblox username to help ensure accurate account details.\n\nComplete checkout using the available payment methods shown on the website.\n\nAfter payment confirmation, submitted order details are reviewed and prepared by our team.\n\nCustomers should follow any instructions or updates provided after checkout.\n\nProcessing times may vary depending on queue volume, product availability, and order status.",
      },
      {
        q: "How long does delivery usually take?",
        a: "Most orders are completed within 5 to 30 minutes. During busy periods, delivery may take longer, up to a few hours.",
      },
      {
        q: "What should I do if I entered the wrong Roblox username?",
        a: "Before checkout, customers can verify their Roblox username using our username verification system to help ensure the correct account details are submitted. Please carefully review all information before completing your order.",
      },
      {
        q: "Can I cancel or refund an order?",
     a: "Refund requests are reviewed based on order status and delivery progress. If an order cannot be completed or delivered, eligible customers may receive a full refund according to our support review process.",
      },
      {
      q: "Does Bloxhop host community giveaways?",
      a: "Yes. Bloxhop occasionally hosts limited-time giveaways and community events through our official channels. Follow our updates and Discord announcements for future giveaway opportunities and participation details.",
      },
      {
        q: "Where can I ask for order help?",
        a: "You can contact support through Discord or the support details shown on the website.",
      },
    ].map((item, index) => (
      <div
        key={item.q}
       className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628]/80 transition hover:border-blue-400/30"
      >
        <button
          onClick={() => setOpenFaq(openFaq === index ? null : index)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-base font-black text-white md:text-lg">
            {item.q}
          </span>

          <svg
  xmlns="http://www.w3.org/2000/svg"
  className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
    openFaq === index ? "rotate-180 text-blue-300" : ""
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

        {openFaq === index && (
          <div className="border-t border-white/5 px-6 pb-5 pt-1">
            <p className="text-sm leading-7 text-slate-400">
              {item.a}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
</section>
      <>
<section className="relative w-full overflow-hidden border-t border-white/10 bg-[#07111f]">

  <img
    src="/mm2-logo.png"
    alt="Adopt Me Shop"
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

           
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={clearCart}
                className="rounded-2xl bg-[#142846]/80 py-3 font-semibold hover:bg-[#1b3558]/80"
              >
                Clear
              </button>

              <Link
                href="/checkout"
                className={`rounded-2xl py-3 text-center font-bold transition ${
                  cartItems.length === 0
                    ? "pointer-events-none bg-slate-700 text-slate-300"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                Proceed to Checkout
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
  ? "bg-blue-500 text-white shadow-[0_0_35px_rgba(59,130,246,0.55)]"
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
    className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-[premiumFloat_3.5s_ease-in-out_infinite] items-center gap-4 overflow-hidden rounded-[2rem] border border-pink-400/30 bg-gradient-to-br from-[#2b0f3f] via-[#1b1038] to-[#091224] px-7 py-4 shadow-[0_0_55px_rgba(236,72,153,0.55)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_80px_rgba(168,85,247,0.75)]">
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
    <div className="animate-[vacuumCard_.9s_ease-in-out_forwards] w-[420px] overflow-hidden rounded-[2rem] border border-blue-300/30 bg-gradient-to-br from-[#081225] via-[#0b1730] to-[#06101d] p-4 shadow-[0_0_90px_rgba(59,130,246,0.7)]">
      <div className="flex h-[230px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-500/20 via-[#07111f] to-cyan-400/10 p-5">
        {flyingCardProduct.image_url && (
          <img
            src={flyingCardProduct.image_url}
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
    <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-blue-300/30 bg-gradient-to-br from-[#081225] via-[#0b1730] to-[#06101d] p-1 shadow-[0_0_120px_rgba(59,130,246,0.65)]">
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
        {!isCartOpen && <SupportChat />}
      </>
    </div>
  );
}
