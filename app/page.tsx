"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const text = "Support Center";

type Product = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  compare_at_price?: number | null;
  tag: string | null;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
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
    "Welcome to BLOXHOP. Browse trusted digital products and online service packages before checkout."
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [currencyView, setCurrencyView] = useState<"USD" | "PHP" | "BOTH">("USD");
  const [usdToPhpRate, setUsdToPhpRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);


  const PRODUCTS_PER_PAGE = 6;

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

      setProducts(result.products || []);
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

  function isUnavailable(product: Product) {
    const quantity = Number(product.stock_quantity ?? 0);
    return (
      quantity <= 0 ||
      product.stock === "Out of Stock" ||
      product.is_active === false
    );
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

  function formatPhp(usdAmount: number) {
    if (!usdToPhpRate) return null;
    return usdAmount * usdToPhpRate;
  }

  function renderPrice(product: Product) {
    const usd = Number(product.price);
    const php = formatPhp(usd);

    if (currencyView === "USD") {
      return (
        <p className="text-3xl font-extrabold text-sky-300">
          ${usd.toFixed(2)}
        </p>
      );
    }

    if (currencyView === "PHP") {
      return (
        <p className="text-3xl font-extrabold text-sky-300">
          {php ? `₱${php.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}` : "PHP unavailable"}
        </p>
      );
    }

    return (
      <div>
        <p className="text-3xl font-extrabold text-sky-300">
          ${usd.toFixed(2)}
        </p>
        <p className="mt-1 text-sm text-slate-400">
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1700px] px-4 py-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-700/60 bg-[#0f1b2d]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <p className="text-xl font-black tracking-tight">BLOXHOP</p>
            <span className="hidden text-sm text-slate-400 sm:inline">
              Digital products & online services
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
                <span className="flex max-w-0 overflow-hidden whitespace-nowrap transition-all duration-700 ease-out group-hover:max-w-[180px]">
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

            <Link
              href="/track-order"
              className="rounded-2xl border border-slate-700/60 bg-[#10213a]/65 px-4 py-2 text-sm font-medium hover:bg-[#142846]/80"
            >
              Track Order
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              Cart ({cartCount})
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <main className="min-w-0">
            <section className="rounded-[2rem] border border-slate-700/60 bg-[#0b1628]/70 p-4 md:p-6">
              <div className="mb-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold">Digital Products & Online Services</h1>
                    <p className="mt-1 text-sm text-slate-400">
                      Browse secure digital products, service packages, and support options.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCurrencyView("USD")}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        currencyView === "USD"
                          ? "bg-blue-500 text-white"
                          : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
                      }`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setCurrencyView("PHP")}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        currencyView === "PHP"
                          ? "bg-blue-500 text-white"
                          : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
                      }`}
                    >
                      PHP
                    </button>
                    <button
                      onClick={() => setCurrencyView("BOTH")}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        currencyView === "BOTH"
                          ? "bg-blue-500 text-white"
                          : "bg-[#142846]/80 text-white hover:bg-[#1b3558]/90"
                      }`}
                    >
                      Both
                    </button>
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

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700/60 bg-[#0b1628] px-4 py-3 outline-none"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-low-high">Sort: Price Low to High</option>
                    <option value="price-high-low">Sort: Price High to Low</option>
                    <option value="name-a-z">Sort: Name A to Z</option>
                    <option value="name-z-a">Sort: Name Z to A</option>
                  </select>
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

                      return (
                        <div
                          key={product.id}
                          className="group overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[#0f1b2d]/95 backdrop-blur-md shadow-[0_16px_45px_rgba(2,6,23,0.32)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-blue-400/30 hover:shadow-[0_20px_55px_rgba(2,6,23,0.45)]"
                        >
                          <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-500/10 via-slate-900/20 to-sky-400/10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_35%)]" />

                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                              <span className="rounded-full bg-[#09111f] px-3 py-1 text-xs font-bold text-sky-300">
                                {product.tag || "Digital Service"}
                              </span>

                              {discountPercent ? (
                                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                                  {discountPercent}% OFF
                                </span>
                              ) : null}
                            </div>

                            <span
                              className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                                stockLabel === "Out of Stock"
                                  ? "bg-red-500/15 text-red-300"
                                  : stockLabel === "Limited"
                                  ? "bg-yellow-500/15 text-yellow-300"
                                  : "bg-emerald-500/15 text-emerald-300"
                              }`}
                            >
                              {stockLabel}
                            </span>

                            <div className="flex h-full items-center justify-center p-6">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="max-h-full max-w-full rounded-2xl object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-sky-300 shadow-[0_0_60px_rgba(59,130,246,0.20)]" />
                              )}
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="min-w-0">
                              <h3 className="truncate text-2xl font-bold">
                                {product.name}
                              </h3>
                              <p className="mt-1 text-xs text-slate-400">
                                {product.category || "General"}
                              </p>
                            </div>

                            <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                              {product.description || "Digital product or online service fulfilled after order confirmation."}
                            </p>

                            <div className="mt-4 grid gap-2">
                              <span className="rounded-xl border border-slate-700/60 bg-[#10213a]/65 px-3 py-2 text-xs text-slate-300">
                                Fulfillment method: Digital delivery or online service fulfillment
                              </span>
                              <span className="rounded-xl border border-slate-700/60 bg-[#10213a]/65 px-3 py-2 text-xs text-slate-300">
                                Estimated fulfillment: 5–30 minutes
                              </span>
                              {quantity > 0 && quantity <= 3 ? (
                                <span className="rounded-xl border border-yellow-400/10 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
                                  Few left in stock
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4">
                              {quantity > 0 ? (
                                <p className="text-sm text-slate-400">
                                  {quantity <= 3 ? (
                                    <span className="text-yellow-300">
                                      Limited stock available
                                    </span>
                                  ) : (
                                    <span>Available for order</span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-sm font-semibold text-red-300">
                                  Currently unavailable
                                </p>
                              )}
                            </div>

                            <div className="mt-5 flex items-end justify-between gap-3">
                              <div>
                                {renderPrice(product)}

                               {product.compare_at_price &&
 Number(product.compare_at_price) > Number(product.price) && (
  <p className="mt-1 text-sm font-semibold text-slate-300 line-through decoration-red-400">
    {currencyView === "USD" && (
      `$${Number(product.compare_at_price).toFixed(2)}`
    )}

    {currencyView === "PHP" && usdToPhpRate && (
      `₱${(Number(product.compare_at_price) * usdToPhpRate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    )}

    {currencyView === "BOTH" && usdToPhpRate && (
      <>
        ${Number(product.compare_at_price).toFixed(2)}
        <span className="block text-xs text-slate-500">
          ≈ ₱{(Number(product.compare_at_price) * usdToPhpRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </>
    )}
  </p>
)}
                              </div>

                              <button
                                onClick={() => handleBuy(product)}
                                className={`rounded-2xl px-5 py-3 font-bold transition ${
                                  outOfStock
                                    ? "cursor-not-allowed bg-slate-700 text-slate-300"
                                    : "bg-blue-500 text-white hover:bg-blue-400"
                                }`}
                                disabled={outOfStock || product.is_active === false}
                              >
                                {outOfStock ? "Unavailable" : "Add to Cart"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
                </>
              )}
            </section>
          </main>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-700/60 bg-[#0f1b2d] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                  Store Info
                </p>
                <h2 className="mt-3 text-3xl font-black">BLOXHOP</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Digital products and online service packages with order tracking,
                  fulfillment information, and customer support access.
                </p>
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
                    <span className="font-bold text-sky-300">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {usdToPhpRate ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Est. PHP</span>
                      <span className="font-bold text-sky-300">
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
                  <li>1. Select your preferred product.</li>
                  <li>2. Review your cart and proceed to checkout.</li>
                  <li>3. Enter your contact details and service information.</li>
                  <li>4. Receive digital fulfillment or service fulfillment after payment confirmation.</li>
                </ol>
              </div>
	<div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5 mt-4">
  		<h3 className="text-lg font-bold text-emerald-300">
 		   Order Fulfillment
 		 </h3>

 	 <div className="mt-3 space-y-2 text-sm text-slate-300">
  	  <p>• Orders are processed after payment confirmation</p>
  	  <p>• Fulfillment is completed through digital access, email, or online coordination</p>
   	 <p>• Service details will be confirmed using the information provided during checkout</p>
    	<p>• Estimated fulfillment: 5–30 minutes (up to 3 hours in some cases)</p>
  		</div>
	</div>

              <div className="rounded-[2rem] border border-slate-700/60 bg-[#10213a]/65 p-5">
                <h3 className="text-lg font-bold text-white">Important Information</h3>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <p>All products and services listed on this website are digital or online-based.</p>
                  <p>No physical products are shipped.</p>
                  <p>Prices are shown in USD, with optional PHP estimate display.</p>
                  <p>Please ensure your contact and order information is accurate during checkout.</p>
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

              <div className="rounded-[2rem] border border-slate-700/60 bg-[#10213a]/65 p-5">
                <h3 className="text-lg font-bold text-white">Business Information</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>Bloxhop Online Store</p>
                  <p>Digital products and online services store</p>
                  <p>Location: Philippines</p>
                  <p>Email: support@bloxhop.site</p>
                </div>
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
                  ${totalPrice.toFixed(2)}
                </p>
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
                        <p className="mt-1 text-sm text-slate-400">
                          {item.tag || "Digital Service"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                        <p className="mt-2 font-bold text-sky-300">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
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
              <span className="text-sky-300">${totalPrice.toFixed(2)}</span>
            </div>

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
      </>
    </div>
  );
}