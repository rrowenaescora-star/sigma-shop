"use client";

import { useMemo, useState } from "react";

type Product = {
  name: string;
  price: number;
  tag: string;
  stock: "In Stock" | "Limited" | "Out of Stock";
  category: "Popular Items" | "Bundles" | "Passes" | "Offers";
};

export default function Home() {
  const allProducts: Product[] = [
    {
      name: "Starter Pack",
      price: 9.99,
      tag: "Popular",
      stock: "In Stock",
      category: "Popular Items",
    },
    {
      name: "Pro Pack",
      price: 19.99,
      tag: "Hot",
      stock: "Limited",
      category: "Bundles",
    },
    {
      name: "VIP Pack",
      price: 49.99,
      tag: "Premium",
      stock: "Out of Stock",
      category: "Offers",
    },
    {
      name: "Ultra Bundle",
      price: 79.99,
      tag: "New",
      stock: "In Stock",
      category: "Bundles",
    },
    {
      name: "Mega Pass",
      price: 24.99,
      tag: "Sale",
      stock: "In Stock",
      category: "Passes",
    },
    {
      name: "Legend Pack",
      price: 99.99,
      tag: "Top",
      stock: "Limited",
      category: "Offers",
    },
  ];

  const [shopName] = useState("REAL");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<Product[]>([]);
  const [message, setMessage] = useState("Welcome to REAL.");

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, search, selectedCategory]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  function addToCart(product: Product) {
    if (product.stock === "Out of Stock") {
      setMessage(`${product.name} is currently unavailable.`);
      return;
    }

    setCart((prev) => [...prev, product]);
    setMessage(`${product.name} added to cart.`);
  }

  function clearCart() {
    setCart([]);
    setMessage("Cart cleared.");
  }

  function handleLogin() {
    setMessage("Login button clicked.");
  }

  function handleOpenCart() {
    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const itemNames = cart.map((item) => item.name).join(", ");
    setMessage(`Cart opened: ${itemNames}`);
  }

  function handleCheckout() {
    if (cart.length === 0) {
      setMessage("Add items to your cart before checkout.");
      return;
    }

    setMessage(
      `Checkout clicked. Total: $${totalPrice.toFixed(2)} for ${cart.length} item(s).`
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-[#0b1020] p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Store
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">{shopName}</h1>
          </div>

          <div className="mt-8">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-8 space-y-3">
            {["All", "Popular Items", "Bundles", "Passes", "Offers"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedCategory(item);
                    setMessage(`Showing category: ${item}`);
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    selectedCategory === item
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-white/5 hover:bg-cyan-400 hover:text-slate-950"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 p-5 border border-white/10">
            <p className="text-sm text-slate-300">Cart Items</p>
            <h3 className="mt-2 text-4xl font-extrabold">{cart.length}</h3>
            <p className="mt-2 text-sm text-slate-300">
              Total: ${totalPrice.toFixed(2)}
            </p>

            <button
              onClick={handleOpenCart}
              className="mt-4 w-full rounded-2xl bg-cyan-400 py-3 font-bold text-slate-950"
            >
              Open Cart
            </button>

            <button
              onClick={clearCart}
              className="mt-3 w-full rounded-2xl bg-white/10 py-3 font-semibold"
            >
              Clear Cart
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-white/10 bg-[#0a1020]/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-extrabold lg:hidden">{shopName}</h2>
                <p className="text-sm text-slate-400">Modern digital storefront</p>
              </div>

              <div className="hidden md:block w-full max-w-md mx-6">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium"
                >
                  Login
                </button>

                <button
                  onClick={handleOpenCart}
                  className="rounded-2xl bg-violet-400 px-4 py-2 text-sm font-bold text-slate-950"
                >
                  Cart ({cart.length})
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8">
            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182d] via-[#141d36] to-[#1d2248] p-8 shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Active Store
                </p>
                <h3 className="mt-4 max-w-3xl text-5xl font-black leading-tight">
                  {shopName} now has working buttons and cart logic
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  Search products, switch categories, add items to cart, clear the
                  cart, and simulate checkout.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => setMessage("Explore Store clicked.")}
                    className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Explore Store
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="rounded-2xl bg-white/10 px-6 py-3 font-semibold"
                  >
                    Checkout
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Products Showing</p>
                  <h4 className="mt-2 text-4xl font-extrabold">
                    {filteredProducts.length}
                  </h4>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Cart Count</p>
                  <h4 className="mt-2 text-4xl font-extrabold">{cart.length}</h4>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              {message}
            </section>

            <section className="mt-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold">Featured Products</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Click the buttons to test the interactions
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="rounded-2xl bg-white/10 px-4 py-2 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.name}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#101729] shadow-xl transition hover:-translate-y-1 hover:border-violet-300/30"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/20">
                      <span className="absolute left-4 top-4 rounded-full bg-[#0a1120] px-3 py-1 text-xs font-bold text-cyan-300">
                        {product.tag}
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

                      <div className="flex h-full items-center justify-center">
                        <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_60px_rgba(103,232,249,0.25)]" />
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-2xl font-bold">{product.name}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Category: {product.category}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-extrabold text-cyan-300">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className={`rounded-2xl px-5 py-3 font-bold ${
                            product.stock === "Out of Stock"
                              ? "bg-slate-700 text-slate-300"
                              : "bg-violet-400 text-slate-950 hover:brightness-110"
                          }`}
                          disabled={product.stock === "Out of Stock"}
                        >
                          {product.stock === "Out of Stock"
                            ? "Unavailable"
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  No products matched your search.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
