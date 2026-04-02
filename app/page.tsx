"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  tag: string;
  stock: "In Stock" | "Limited" | "Out of Stock";
};

export default function Home() {
  const products: Product[] = [
    { id: 1, name: "Starter Pack", price: .90, tag: "Popular", stock: "In Stock" },
    { id: 2, name: "Pro Pack", price: 19.99, tag: "Hot", stock: "Limited" },
    { id: 3, name: "VIP Pack", price: 49.99, tag: "Premium", stock: "Out of Stock" },
    { id: 4, name: "Ultra Bundle", price: 79.99, tag: "New", stock: "In Stock" },
    { id: 5, name: "Mega Pass", price: 24.99, tag: "Sale", stock: "In Stock" },
    { id: 6, name: "Legend Pack", price: 99.99, tag: "Top", stock: "Limited" },
  ];

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [message, setMessage] = useState("Welcome to REAL.");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("real-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("real-cart", JSON.stringify(cartItems));
  }, [cartItems]);

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
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

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
                <button className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium">
                  Login
                </button>

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
              <div className="mb-6">
                <h3 className="text-3xl font-extrabold">Featured Products</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Click Buy to add items to the cart
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#101729] shadow-xl"
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

                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-3xl font-extrabold text-cyan-300">
                          ${product.price.toFixed(2)}
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
                          <p className="mt-1 text-sm text-slate-400">{item.tag}</p>
                          <p className="mt-2 text-cyan-300 font-bold">
                            ${item.price.toFixed(2)}
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
