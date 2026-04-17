"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const text = "Join our Discord";

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
};

type CartItem = Product & {
  quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState(
    "Welcome to BLOXHOP. Secure your Blox Fruits items today."
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("real-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);

      const response = await fetch("/api/products");
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

  function isOutOfStock(product: Product) {
    const quantity = Number(product.stock_quantity ?? 0);
    return quantity <= 0 || product.stock === "Out of Stock";
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
    if (isOutOfStock(product)) {
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

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.14),transparent_30%)] pointer-events-none" />

      <div className="flex min-h-screen relative">
        <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 overflow-hidden border-r border-white/10 bg-[#08101d]">
          <img
            src="/man_isolated_zoom.gif"
            alt="Sidebar background"
            className="absolute inset-0 h-full w-full object-cover object-left opacity-35"
          />

          <div className="absolute inset-0 bg-[#07101c]/75" />

          <div className="relative z-10 flex h-full w-full flex-col p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Premium Store
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">BLOXHOP</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Fast and trusted Blox Fruits item shopping with a cleaner experience.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                Quick Stats
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Products</span>
                  <span className="font-bold text-white">{products.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Cart Items</span>
                  <span className="font-bold text-white">{cartCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Cart Total</span>
                  <span className="font-bold text-cyan-300">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-300">Categories</p>
              <div className="mt-4 flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedCategory === category
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-300">Search</p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-300">Sort</p>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none"
              >
                <option value="default">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
                <option value="name-z-a">Name: Z to A</option>
              </select>
            </div>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Ready to checkout?</p>
              <h3 className="mt-2 text-4xl font-extrabold">{cartCount}</h3>
              <p className="mt-2 text-sm text-slate-300">
                Total: ${totalPrice.toFixed(2)}
              </p>
              <button
                onClick={() => setIsCartOpen(true)}
                className="mt-4 w-full rounded-2xl bg-violet-400 py-3 font-bold text-slate-950 transition hover:brightness-110"
              >
                Open Cart
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:ml-72 flex-1 relative">
          <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1020]/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-extrabold lg:hidden">BLOXHOP</h2>
                <p className="text-sm text-slate-400">Premium Blox Fruits shop</p>
              </div>

              <div className="flex items-center gap-3">
	
		
   <Link
      href="https://discord.gg/EEpftCnkgv"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-block"
    >
      <div className="flex items-center overflow-hidden rounded-full  px-1 py-2">
        <span className="flex max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[180px] transition-all duration-600 ease-out">
          {text.split("").map((char, i) => (
            <span
              key={i}
	
               className={`inline-block
      opacity-0 translate-y-2
      group-hover:opacity-100 group-hover:translate-y-0
      transition-all duration-300
      ${char === " " ? "mx-1" : ""}
    `}
    style={{ transitionDelay: `${i * 60}ms` }}
	
		
     
            >
           {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>

        <Image
          src="/discord1.png"
          alt="Discord"
          width={40}
          height={40}
          priority
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ml-2 translate-x-0 group-hover:-translate-x-1 transition-all  duration-500 ease-out"
        />
      </div>
    </Link>

                <Link
                  href="/track-order"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                >
                  Track Order
                </Link>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-2xl bg-violet-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:brightness-110"
                >
                  Cart 🛒 ({cartCount})
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8">
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-[#0d1528] to-violet-400/10 p-8">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

                <div className="relative">
                  <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                    Trusted Item Store
                  </span>

                  <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
                    Buy Blox Fruits items with fast digital delivery and secure checkout.
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                    Browse discounted deals, limited stock items, and secure your order with a smoother shopping experience.
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Delivery: 5–30 minutes | Support: bloxhop@bloxhop.site
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const section = document.getElementById("products-section");
                        section?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:brightness-110"
                    >
                      Browse Products
                    </button>

                    <Link
                      href="/track-order"
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
                    >
                      Track Your Order
                    </Link>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                      ⚡ Fast ordering
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                      🔒 Secure checkout
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                      🎁 Limited offers
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Products Loaded</p>
                  <h3 className="mt-3 text-4xl font-black">{products.length}</h3>
                  <p className="mt-2 text-sm text-slate-400">Live from your database</p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Items in Cart</p>
                  <h3 className="mt-3 text-4xl font-black">{cartCount}</h3>
                  <p className="mt-2 text-sm text-slate-400">Ready for checkout</p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Current Total</p>
                  <h3 className="mt-3 text-4xl font-black text-cyan-300">
                    ${totalPrice.toFixed(2)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">Your selected order value</p>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <h3 className="text-lg font-bold text-cyan-300">
                  Delivery Information
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  All items are digitally delivered directly in-game using your Roblox username.
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Delivery time is usually 5–30 minutes and may take up to 3 hours in rare cases.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                <h3 className="text-lg font-bold text-emerald-300">
                  Refund & Support
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  If your order is not delivered within 3 hours, you may be eligible for a refund.
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Contact us anytime at:
                </p>
                <p className="mt-1 font-semibold text-white">
                  bloxhop@bloxhop.site
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              {message}
            </section>

            <section
              id="products-section"
              className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:p-6"
            >
              <div className="mb-6 flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h3 className="text-3xl font-extrabold">Featured Products</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Discover discounted and limited stock items
                    </p>
                  </div>

                  <button
                    onClick={loadProducts}
                    className="rounded-2xl bg-violet-400 px-4 py-3 font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Refresh Products
                  </button>
                </div>

                <div className="grid gap-3 xl:grid-cols-[1fr_220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, category, or tag..."
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1222] px-4 py-3 outline-none placeholder:text-slate-500"
                  />

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1222] px-4 py-3 outline-none"
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
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[900px] overflow-y-auto pr-2">
                {loadingProducts ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                    No products found for this filter or search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredProducts.map((product) => {
                      const stockLabel = getStockLabel(product);
                      const outOfStock = isOutOfStock(product);
                      const quantity = Number(product.stock_quantity ?? 0);
                      const discountPercent = getDiscountPercent(product);
                      const savingsAmount = getSavingsAmount(product);

                      return (
                        <div
                          key={product.id}
                          className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1324] shadow-[0_10px_50px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20"
                        >
                          <div className="relative h-72 overflow-hidden bg-gradient-to-br from-cyan-400/15 via-transparent to-violet-400/15">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.15),transparent_35%)]" />

                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                              <span className="rounded-full bg-[#09111f] px-3 py-1 text-xs font-bold text-cyan-300">
                                {product.tag || "Item"}
                              </span>

                              {discountPercent ? (
                                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                                  🔥 {discountPercent}% OFF
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
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_60px_rgba(103,232,249,0.25)]" />
                              )}
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="truncate text-2xl font-bold">{product.name}</h4>
                                <p className="mt-1 text-xs text-slate-400">
                                  {product.category || "Uncategorized"}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                              {product.description || "No description available."}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                🔒 Secure checkout
                              </span>
                              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                ⚡ Fast processing
                              </span>
                              {quantity > 0 && quantity <= 3 ? (
                                <span className="rounded-xl border border-yellow-400/10 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
                                  ⏳ Few left
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4">
                              {quantity > 0 ? (
                                <p className="text-sm text-slate-400/0">
                                  {quantity <= 3 && (
                                    <span className="ml-2 text-yellow-300">
                                      Only a few left
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-sm font-semibold text-red-300">
                                  Currently unavailable
                                </p>
                              )}
                            </div>

                            <div className="mt-5">
                              <div className="flex items-end justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-3xl font-extrabold text-cyan-300">
                                      ${Number(product.price).toFixed(2)}
                                    </p>

                                    {product.compare_at_price &&
                                    Number(product.compare_at_price) > Number(product.price) ? (
                                      <p className="text-lg font-semibold  text-slate-300  line-through decoration-red-400 ">
                                        ${Number(product.compare_at_price).toFixed(2)}
                                      </p>
                                    ) : null}
                                  </div>

                                  {savingsAmount ? (
                                    <p className="mt-1 text-xs font-semibold text-emerald-300">
                                      You save ${savingsAmount.toFixed(2)}
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Premium item pricing
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleBuy(product)}
                                  className={`rounded-2xl px-5 py-3 font-bold transition ${
                                    outOfStock
                                      ? "cursor-not-allowed bg-slate-700 text-slate-300"
                                      : "bg-violet-400 text-slate-950 hover:brightness-110"
                                  }`}
                                  disabled={outOfStock}
                                >
                                  {outOfStock ? "Unavailable" : "Buy Now"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              <h3 className="mb-2 text-lg font-bold text-white">
                Business Information
              </h3>

              <p>Bloxhop</p>
              <p>Digital goods store for Blox Fruits items</p>
              <p>Location: Philippines</p>
              <p>Email: bloxhop@bloxhop.site</p>
            </section>
          </div>
        </main>
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
          className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d1324] shadow-2xl transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold">Your Cart</h3>
                <p className="text-sm text-slate-400">{cartCount} item(s)</p>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Items
                </p>
                <p className="mt-2 text-2xl font-black">{cartCount}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-2xl font-black text-cyan-300">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate text-lg font-bold">{item.name}</h4>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.tag || "Item"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                        <p className="mt-2 font-bold text-cyan-300">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="rounded-lg bg-white/10 px-3 py-1 font-bold hover:bg-white/15"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="rounded-lg bg-white/10 px-3 py-1 font-bold hover:bg-white/15"
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

          <div className="border-t border-white/10 p-6">
            <div className="mb-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Secure checkout ready. Review your items before proceeding.
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-cyan-300">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={clearCart}
                className="rounded-2xl bg-white/10 py-3 font-semibold hover:bg-white/15"
              >
                Clear
              </button>

              <Link
                href="/checkout"
                className={`rounded-2xl py-3 text-center font-bold transition ${
                  cartItems.length === 0
                    ? "pointer-events-none bg-slate-700 text-slate-300"
                    : "bg-cyan-400 text-slate-950 hover:brightness-110"
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