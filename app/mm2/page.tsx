"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import TrustBadges from "@/components/TrustBadges";
import SupportChat from "@/components/SupportChat";

const text = "Join Discord";

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
  const [showPromoPopup, setShowPromoPopup] = useState(true);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // NEW: capital amount available for fulfilling orders.
  // Products still show, but if capital is lower than the product price, Add to Cart becomes unavailable.
  const [availableCapital, setAvailableCapital] = useState<number | null>(null);

  const promoTitle = "Limited Time Promo";
  const promoDiscount = "10% OFF";
  const promoMessage = "Use your promo before the sale ends!";

  const PRODUCTS_PER_PAGE = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPromoPopup(false);
    }, 4000);

    return () => clearTimeout(timer);
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

      const bloxFruitsProducts = (result.products || []).filter(
     (product: Product) => product.game === "mm2"
 );

    setProducts(bloxFruitsProducts);


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
    setIsCartOpen(true);
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
        <p className="text-3xl font-extrabold text-emerald-300">
          ${usd.toFixed(2)}
        </p>
      );
    }

    if (currencyView === "PHP") {
      return (
        <p className="text-3xl font-extrabold text-emerald-300">
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
       <p className="text-3xl font-extrabold text-emerald-300">
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
        <p className="text-3xl font-extrabold text-emerald-300">
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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      {showPromoPopup && (
        <div className="fixed inset-0 z-40 backdrop-blur-md transition-all duration-1000" />
      )}

      <div
        className={`fixed z-50 transition-all duration-1000 ease-in-out ease-out hover:scale-120 ${
          showPromoPopup
            ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-100"
            : "-bottom-16 left-5 scale-110"
        }`}
      >
        <div className="relative text-center">
          <img
            src="/bloxbot.png"
            alt="Bloxhop Promo"
            className={`relative z-20 mx-auto object-contain drop-shadow-2xl transition-all duration-1000 ease-in-out animate-[bloxbotLife_5s_ease-in-out_infinite] ${
              showPromoPopup ? "w-[380px]" : "w-[170px]"
            }`}
          />

          {showPromoPopup && (
            <div
              className={`relative z-10 -mt-32 rounded-[2rem] border border-cyan-400/20 bg-[#0f1b2d]/95 px-6 pb-6 pt-32 shadow-2xl backdrop-blur-md transition-all duration-700 ${
                showPromoPopup
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                {promoTitle}
              </p>

              <h2 className="mt-2 text-4xl font-black text-white">
                {promoDiscount}
              </h2>

              <p className="mt-3 text-sm text-slate-300">
                {promoMessage}
              </p>

              <button
                onClick={() => setShowPromoPopup(false)}
                className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:opacity-90"
              >
                Shop Now
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1700px] px-4 py-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-700/60 bg-[#0f1b2d]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <p className="text-xl font-black tracking-tight">MM2 STORE</p>
            <span className="hidden text-sm text-slate-400 sm:inline">
              Fast & Reliable Gaming Services
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="https://discord.gg/EEpftCnkgv"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden sm:inline-block"
            >
              <div className="flex items-center overflow-hidden rounded-full px-1 py-2">
                <span className="flex max-w-0 overflow-hidden whitespace-nowrap transition-all duration-1000 ease-out group-hover:max-w-[180px]">
                  {text.split("").map((char, i) => (
                    <span
                      key={i}
                      className={`inline-block opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
                        char === " " ? "mx-1" : ""
                      }`}
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>

                <Image
                  src="/discord2.png"
                  alt="Discord"
                  width={40}
                  height={40}
                  priority
                  className="ml-2 h-8 w-8 sm:h-10 sm:w-10"
                />
              </div>
            </Link>

            <div className="flex items-center rounded-full border border-white/5 bg-[#111827]/95 p-1 shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <button
                onClick={() => setCurrencyView("USD")}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  currencyView === "USD"
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <img
                  src="https://flagcdn.com/w20/us.png"
                  alt="USD"
                  className="h-4 w-4 rounded-full"
                />
                USD
              </button>

              <button
                onClick={() => setCurrencyView("PHP")}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  currencyView === "PHP"
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <img
                  src="https://flagcdn.com/w20/ph.png"
                  alt="PHP"
                  className="h-4 w-4 rounded-full"
                />
                PHP
              </button>
		<button
 			 onClick={() => setCurrencyView("INR")}
 			 className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
   			 currencyView === "INR"
     				 ? "bg-blue-500 text-white"
  			    : "text-slate-300 hover:bg-white/5"
 		      }`}
		>
 		     <img
 			   src="https://flagcdn.com/w20/in.png"
  			  alt="INR"
 			   className="h-4 w-4 rounded-full"
 				 />
 			 INR
		</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <main className="min-w-0">
            <section className="min-h-[1400px] xl:min-h-[1750px] rounded-[2rem] border border-slate-700/60 bg-[#0b1628]/70 p-4 md:p-6">
              <div className="mb-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                      Trusted MM2 Digital Items
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-2xl border border-slate-700/60 bg-[#0b1628] px-4 py-3 outline-none placeholder:text-slate-500"
                  />

                  <div className="relative w-[230px]">
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

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        selectedCategory === category
                          ? "bg-blue-500 text-white"
                          : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <TrustBadges />

              <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-blue-500/10 p-4 text-sm text-sky-100">
                {message}
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
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
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {paginatedProducts.map((product) => {
                      const stockLabel = getStockLabel(product);
                      const outOfStock = isUnavailable(product);
                      const quantity = Number(product.stock_quantity ?? 0);
                      const discountPercent = getDiscountPercent(product);
                      const savingsAmount = getSavingsAmount(product);
                      const unavailableReason = getUnavailableReason(product);

                      return (
                        <div
                          key={product.id}
                          className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-600/60 bg-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-blue-400/40"
                        >
                          <div className="relative h-[260px] overflow-hidden border-b border-slate-700/70 bg-gradient-to-br from-emerald-500/20 via-[#07111f] to-blue-700/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_right,rgba(37,99,235,0.20),transparent_40%)]" />

                            {discountPercent ? (
                              <div className="absolute left-0 top-0 z-20 h-32 w-32 overflow-hidden">
                                <div className="absolute left-0 top-0 h-32 w-32 bg-red-500 shadow-lg [clip-path:polygon(0_0,100%_0,0_100%)]">
                                  <div className="absolute left-4 top-4 text-left text-2xl font-black leading-tight text-white">
                                    {discountPercent}%
                                    <br />
                                    OFF
                                  </div>
                                </div>
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
                                  className="h-[220px] w-[220px] object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-sky-300 shadow-[0_0_60px_rgba(59,130,246,0.20)]" />
                              )}
                            </div>
                          </div>

                          <div className="bg-[#07111f] p-5">
                            <h3 className="truncate text-2xl font-black text-white">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-blue-400">
                              {product.category || "General"}
                            </p>

                            <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                              {product.description ||
                                "Digital product or online service fulfilled after order confirmation."}
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

                            <div className="mt-5">
                              <div className="flex flex-wrap items-center gap-3">
                                {renderPrice(product)}

                                {savingsAmount && (
                                  <span className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-300">
                                    {currencyView === "USD" && `Save $${savingsAmount.toFixed(2)}`}

					{currencyView === "PHP" &&
  					usdToPhpRate &&
  					`Save ₱${(savingsAmount * usdToPhpRate).toLocaleString(undefined, {
 					   minimumFractionDigits: 2,
 					   maximumFractionDigits: 2,
  						})}`}

					{currencyView === "INR" &&
  					usdToInrRate &&
 					 `Save ₹${(savingsAmount * usdToInrRate).toLocaleString(undefined, {
 					   minimumFractionDigits: 2,
   					 maximumFractionDigits: 2,
 					 })}`}
                                  </span>
                                )}
                              </div>

                              {product.compare_at_price &&
                                Number(product.compare_at_price) > Number(product.price) && (
                                  <p className="mt-1 text-sm font-bold text-slate-500 line-through decoration-slate-400">
                                    {currencyView === "USD" &&
                                      `$${Number(product.compare_at_price).toFixed(2)}`}

                                    {currencyView === "PHP" &&
                                      usdToPhpRate &&
                                      `₱${(
                                        Number(product.compare_at_price) * usdToPhpRate
                                      ).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}`}

                                    {currencyView === "INR" &&
  					usdToInrRate &&
 					 `₹${(
   					 Number(product.compare_at_price) * usdToInrRate
					  ).toLocaleString(undefined, {
    					minimumFractionDigits: 2,
    					maximumFractionDigits: 2,
 				      })}`}
                                  </p>
                                )}

                              <button
                                onClick={() => handleBuy(product)}
                                className={`mt-5 w-full rounded-2xl px-5 py-4 text-base font-bold transition ${
                                  outOfStock
                                    ? "cursor-not-allowed bg-slate-700 text-slate-300"
                                    : "cursor-pointer bg-blue-500 text-white hover:bg-blue-400"
                                }`}
                                disabled={outOfStock}
                              >
                                {outOfStock ? "Unavailable" : "Add to Cart"}
                              </button>
                            </div>
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

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-700/60 bg-[#0f1b2d] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                  Store Info
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  BLOXHOP ONLINE STORE
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Bloxhop provides Blox Fruits digital products, permanent fruits,
                  gamepasses, bundles, and online services with secure checkout and
                  fast fulfillment.
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-4 text-sm text-slate-300">
                  <p>⚡ Fast digital fulfillment</p>
                  <p>🛒 Permanent fruits & game services</p>
                  <p>🔒 Secure checkout & order tracking</p>
                  <p>💬 Discord community support available</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-700/60 bg-[#10213a]/65 p-5">
                <p className="text-sm font-semibold text-slate-200">Order Summary</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Products</span>
                    <span className="font-bold text-white">{products.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cart Items</span>
                    <span className="font-bold text-white">{cartCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold text-emerald-300">
                      {formatMoney(totalPrice)}
                    </span>
                  </div>
                  {currencyView !== "PHP" && usdToPhpRate ? (
  <div className="flex items-center justify-between">
    <span className="text-slate-400">Est. PHP</span>
    <span className="font-bold text-emerald-300">
      ₱
      {(totalPrice * usdToPhpRate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  </div>
) : null}
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="mt-4 w-full rounded-2xl bg-blue-500 py-3 font-bold text-white transition hover:bg-blue-400"
                >
                  Review Order
                </button>
              </div>

              <div className="rounded-[2rem] border border-cyan-400/20 bg-blue-500/10 p-5">
                <h3 className="text-lg font-bold text-sky-300">How it works</h3>
                <ol className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>1. Choose your Blox Fruits product or service.</li>
                  <li>2. Enter your Roblox username, email, or contact details.</li>
                  <li>3. Apply a coupon code if available and complete secure checkout.</li>
                  <li>4. Receive your item through in-game delivery after payment confirmation.</li>
                </ol>
              </div>

              <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5 mt-4">
                <h3 className="text-lg font-bold text-emerald-300">
                  Delivery Process
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>• Complete checkout and payment confirmation</p>
                  <p>• Enter your Roblox username and contact details correctly</p>
                  <p>• Our team prepares and verifies your order</p>
                  <p>• Items are delivered after payment confirmation through Roblox gifting or in-game delivery</p>
                  <p>• Estimated delivery time: 5–30 minutes (up to 3 hours during high demand)</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 p-5">
                <h3 className="text-lg font-bold text-red-300">
                  Limited Product Availability
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>• Some products have limited stock availability</p>
                  <p>• High-demand items may become unavailable quickly</p>
                  <p>• Availability updates automatically in real time</p>
                  <p>• We recommend completing checkout immediately once available</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
                <h3 className="text-lg font-bold text-emerald-300">
                  Fulfillment & Support
                </h3>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>Estimated fulfillment: 5–30 minutes</p>
                  <p>In rare cases, fulfillment may take up to 3 hours.</p>
                  <p>Support email: support@bloxhop.site</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-5">
                <h3 className="text-lg font-bold text-yellow-200">
                  Refund Notice
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  Refunds are reviewed for non-delivery or fulfillment issues based on the store refund policy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <>
        <div
          onClick={() => setIsCartOpen(false)}
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
            isCartOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />

        <div
          className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-700/60 bg-[#0f1b2d] shadow-2xl transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-slate-700/60 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold">Order Review</h3>
                <p className="text-sm text-slate-400">{cartCount} item(s)</p>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-[#142846]/80 px-4 py-2 text-sm font-semibold hover:bg-[#1b3558]/80"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Items
                </p>
                <p className="mt-2 text-2xl font-black">{cartCount}</p>
              </div>

              <div className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">
                  {formatMoney(totalPrice)}
                </p>

                {usdToPhpRate && (
                  <p className="mt-1 text-sm font-semibold text-sky-200">
                    ≈ ₱{(totalPrice * usdToPhpRate).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 p-5 text-slate-300">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate text-lg font-bold">{item.name}</h4>
                        <p className="mt-1 text-sm text-emerald-200">
                          {item.tag || ""}
                        </p>

                        <p className="mt-1 text-sm text-emerald-200">
                          {formatMoney(Number(item.price))} × {item.quantity}
                        </p>

                        {usdToPhpRate && (
                          <p className="text-sm text-slate-400">
                            ≈ ₱{(Number(item.price) * usdToPhpRate).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} each
                          </p>
                        )}

                        <p className="mt-2 font-bold text-sky-300">
                         {formatMoney(Number(item.price) * item.quantity)}
                        </p>

                        {usdToPhpRate && (
                          <p className="text-sm font-semibold text-sky-200">
                            ≈ ₱{((Number(item.price) * item.quantity) * usdToPhpRate).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="rounded-lg bg-[#142846]/80 px-3 py-1 font-bold hover:bg-[#1b3558]/80"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="rounded-lg bg-[#142846]/80 px-3 py-1 font-bold hover:bg-[#1b3558]/80"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25"
                        >
                          Remove
                        </button>
                      </div>
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
                Checkout
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          disabled={isCartOpen}
          className={`fixed top-1/2 right-6 z-50 flex items-center justify-center rounded-full bg-blue-500 p-4 shadow-[0_10px_35px_rgba(59,130,246,0.45)] transition-all duration-500 ease-in-out hover:scale-110 hover:bg-blue-400 ${
            isCartOpen
              ? "translate-x-12 -translate-y-1/2 opacity-40 scale-90"
              : "translate-x-0 -translate-y-1/2 opacity-100 scale-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-white"
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

          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
              {cartCount}
            </span>
          )}
        </button>

        {!isCartOpen && <SupportChat />}
      </>
    </div>
  );
}
