"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  tag: string | null;
  stock: "In Stock" | "Limited" | "Out of Stock";
  stock_quantity?: number | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  created_at?: string | null;
};

type CartItem = Product & {
  quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("Welcome to REAL.");
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

      const incomingProducts: Product[] = result.products || [];

      // Newest-first fallback in case API is not ordering yet
      const sortedByNewest = [...incomingProducts].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

      setProducts(sortedByNewest);
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
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }

    return sorted;
  }, [products, selectedCategory, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 border-r border-white/10">
          <img
            src="/man_isolated_zoom.gif"
            alt="Sidebar background"
            className="absolute inset-0 h-full w-full object-cover object-left"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 flex h-full w-full flex-col p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                Store
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">REAL</h1>
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
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-300">Sort</p>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-[#101729] px-4 py-3 text-white outline-none"
              >
                <option value="default">Default</option>
                <option value="newest">Newest First</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
                <option value="name-z-a">Name: Z to A</option>
              </select>
            </div>

            <div className="mt-auto rounded-3xl border border-white/50 p-5">
              <p className="text-sm text-slate-300">Cart Items</p>
              <h3 className="mt-2 text-4xl font-extrabold">{cartCount}</h3>
              <p className="mt-2 text-sm text-slate-300">
                Total: ${totalPrice.toFixed(2)}
              </p>
              <button
                onClick={() => setIsCartOpen(true)}
                className="mt-4 w-full rounded-2xl bg-violet-400 py-3 font-bold text-slate-950 hover:brightness-150"
              >
                Open Cart
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:ml-72 flex-1">
          <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1020]/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-extrabold lg:hidden">REAL</h2>
                <p className="text-sm text-slate-400">Blox Fruits shop</p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/track-order"
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium"
                >
                  Track Order
                </Link>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-2xl bg-violet-400 px-4 py-2 text-sm font-bold text-slate-950"
                >
                  Cart 🛒 ({cartCount})
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8">
            <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              {message}
            </section>

            <section className="mt-10">
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-3xl font-extrabold">Featured Products</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Products are loaded from Supabase
                    </p>
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

                    <button
                      onClick={loadProducts}
                      className="rounded-2xl bg-violet-400 px-4 py-2 font-bold text-slate-950"
                    >
                      Refresh Products
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, category, or tag..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                  />

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#101729] px-4 py-3 text-white outline-none"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="newest">Sort: Newest First</option>
                    <option value="price-low-high">Sort: Price Low to High</option>
                    <option value="price-high-low">Sort: Price High to Low</option>
                    <option value="name-a-z">Sort: Name A to Z</option>
                    <option value="name-z-a">Sort: Name Z to A</option>
                  </select>
                </div>
              </div>

              {loadingProducts ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  No products found for this filter/search.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const stockLabel = getStockLabel(product);
                    const outOfStock = isOutOfStock(product);
                    const quantity = Number(product.stock_quantity ?? 0);

                    return (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#101729] shadow-xl"
                      >
                        <div className="relative h-64 bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/20">
                          <span className="absolute left-4 top-4 rounded-full bg-[#0a1120] px-3 py-1 text-xs font-bold text-cyan-300">
                            {product.tag || "Item"}
                          </span>

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
                                className="max-h-full max-w-full rounded-2xl object-contain"
                              />
                            ) : (
                              <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_60px_rgba(103,232,249,0.25)]" />
                            )}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-2xl font-bold">{product.name}</h4>
                              <p className="mt-1 text-xs text-slate-400">
                                {product.category || "Uncategorized"}
                              </p>
                            </div>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {product.description || "No description available."}
                          </p>

                          <div className="mt-3">
                            {quantity > 0 ? (
                              <p className="text-sm text-slate-400">
                                Stock left:{" "}
                                <span className="font-bold text-cyan-300">{quantity}</span>
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

                          <div className="mt-5 flex items-center justify-between">
                            <p className="text-3xl font-extrabold text-cyan-300">
                              ${Number(product.price).toFixed(2)}
                            </p>

                            <button
                              onClick={() => handleBuy(product)}
                              className={`rounded-2xl px-5 py-3 font-bold ${
                                outOfStock
                                  ? "bg-slate-700 text-slate-300"
                                  : "bg-violet-400 text-slate-950 hover:brightness-110"
                              }`}
                              disabled={outOfStock}
                            >
                              {outOfStock ? "Unavailable" : "Buy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <>
        <div
          onClick={() => setIsCartOpen(false)}
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
            isCartOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        <div
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0d1324] border-l border-white/10 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h3 className="text-2xl font-extrabold">Your Cart</h3>
              <p className="text-sm text-slate-400">{cartCount} item(s)</p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
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
                      <div>
                        <h4 className="text-lg font-bold">{item.name}</h4>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.tag || "Item"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                        <p className="mt-2 text-cyan-300 font-bold">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="rounded-lg bg-white/10 px-3 py-1 font-bold"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="rounded-lg bg-white/10 px-3 py-1 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300"
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
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-cyan-300">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={clearCart}
                className="rounded-2xl bg-white/10 py-3 font-semibold"
              >
                Clear
              </button>

              <Link
                href="/checkout"
                className={`rounded-2xl py-3 text-center font-bold ${
                  cartItems.length === 0
                    ? "pointer-events-none bg-slate-700 text-slate-300"
                    : "bg-cyan-400 text-slate-950"
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
