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
  category: string | null;
  description: string | null;
  image_url: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [message, setMessage] = useState("Welcome to REAL.");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  function handleBuy(product: Product) {
    if (product.stock === "Out of Stock") {
      setMessage(`${product.name} is currently unavailable.`);
      return;
    }

    const updatedCart = [...cartItems, product];
    setCartItems(updatedCart);
    setMessage(`${product.name} added to cart.`);
    setIsCartOpen(true);
  }

  function removeFromCart(indexToRemove: number) {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    setMessage("Item removed from cart.");
  }

  function clearCart() {
    setCartItems([]);
    setMessage("Cart cleared.");
  }

  const cartCount = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

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
    return products.filter((product) => {
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
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-[#0b1020] p-6">
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
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 p-5 border border-white/10">
            <p className="text-sm text-slate-300">Cart Items</p>
            <h3 className="mt-2 text-4xl font-extrabold">{cartCount}</h3>
            <p className="mt-2 text-sm text-slate-300">
              Total: ${totalPrice.toFixed(2)}
            </p>
            <button
              onClick={() => setIsCartOpen(true)}
              className="mt-4 w-full rounded-2xl bg-cyan-400 py-3 font-bold text-slate-950"
            >
              Open Cart
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-white/10 bg-[#0a1020]/90 backdrop-blur">
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
                  Cart ({cartCount})
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

                <div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, category, or tag..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  />
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
                  {filteredProducts.map((product) => (
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
                            product.stock === "Out of Stock"
                              ? "bg-red-500/15 text-red-300"
                              : product.stock === "Limited"
                                ? "bg-yellow-500/15 text-yellow-300"
                                : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {product.stock}
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

                        <div className="mt-5 flex items-center justify-between">
                          <p className="text-3xl font-extrabold text-cyan-300">
                            ${Number(product.price).toFixed(2)}
                          </p>

                          <button
                            onClick={() => handleBuy(product)}
                            className={`rounded-2xl px-5 py-3 font-bold ${
                              product.stock === "Out of Stock"
                                ? "bg-slate-700 text-slate-300"
                                : "bg-violet-400 text-slate-950 hover:brightness-110"
                            }`}
                            disabled={product.stock === "Out of Stock"}
                          >
                            {product.stock === "Out of Stock" ? "Unavailable" : "Buy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d1324] border-l border-white/10 z-50 shadow-2xl flex flex-col">
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
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-bold">{item.name}</h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.tag || "Item"}
                          </p>
                          <p className="mt-2 text-cyan-300 font-bold">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(index)}
                          className="rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300"
                        >
                          Remove
                        </button>
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
      )}
    </div>
  );
}
