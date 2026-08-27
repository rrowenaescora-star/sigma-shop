"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageTransitionLink from "@/components/page-transition-link";
import BackTransitionButton from "@/components/back-transition-button";

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
  game?: string | null;
};

type CartItem = Product & { quantity: number };

function isUnavailable(product: Product) {
  return product.stock === "Out of Stock" || Number(product.stock_quantity ?? 0) <= 0;
}

function getShopPath(product: Product) {
  return (product.game || "").toLowerCase().includes("grow") ? "/grow-a-garden-2" : "/home";
}

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const productKey = useMemo(() => {
    try { return decodeURIComponent(params.slug || ""); } catch { return params.slug || ""; }
  }, [params.slug]);

  useEffect(() => {
    document.documentElement.classList.remove("page-transition-out");
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data = await response.json();
        const products: Product[] = data.products || [];
        const match = products.find((item: Product) => item.slug === productKey || String(item.id) === productKey) || null;
        setProduct(match);
        if (match) {
          const saved = localStorage.getItem("recently-viewed-products");
          const priorIds: number[] = saved ? JSON.parse(saved) : [];
          const updatedIds = [match.id, ...priorIds.filter((id) => id !== match.id)].slice(0, 12);
          localStorage.setItem("recently-viewed-products", JSON.stringify(updatedIds));
          setRecentProducts(updatedIds.filter((id) => id !== match.id).map((id) => products.find((item) => item.id === id)).filter((item): item is Product => Boolean(item)));
        }
      } finally { setLoading(false); }
    }
    loadProduct();
  }, [productKey]);

  function addToCart() {
    if (!product || isUnavailable(product)) return;
    const savedCart = localStorage.getItem("real-cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    const existing = cart.find((item) => item.id === product.id);
    const updatedCart = existing
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    localStorage.setItem("real-cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("bloxhop-cart-updated"));
    setAdded(true);
  }

  if (loading) return <main className="min-h-screen bg-[#07111f]" />;
  if (!product) return (
    <main className="min-h-screen bg-[#07111f] px-6 py-24 text-center text-white">
      <h1 className="text-2xl font-black">Product not found</h1>
      <Link href="/home" className="mt-5 inline-flex rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold">Back to shop</Link>
    </main>
  );

  const unavailable = isUnavailable(product);
  const shopPath = getShopPath(product);
  const hasSale = Number(product.compare_at_price || 0) > Number(product.price);

  return (
    <>
      <header className="product-header-enter fixed inset-x-0 top-0 z-50 border-b border-blue-500/10 bg-[#07111f]/95 shadow-[0_15px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 hidden md:block">
            <img src="/blof-fruit-logo.png" alt="" className="h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/90 via-[#07111f]/50 to-[#07111f]/90" />
          </div>
          <div className="relative mx-auto flex max-w-[1850px] items-center justify-between px-5 py-3 md:px-8">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Bloxhop" className="h-11 w-11 object-contain" />
              <div><p className="text-base font-black leading-none tracking-tight text-white sm:text-xl">BLOXHOP ONLINE STORE</p></div>
            </Link>
            <BackTransitionButton fallbackHref={shopPath} className="rounded-lg border border-white/10 bg-[#0b1628]/80 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10">Back to shop</BackTransitionButton>
          </div>
        </div>
        <div className="border-t border-white/5 bg-[#081220]/80"><div className="mx-auto flex max-w-[1850px] items-center gap-3 px-5 py-2 md:px-8"><img src={shopPath === "/grow-a-garden-2" ? "/games/grow-a-garden-2.png" : "/games/bloxfruits.png"} alt="" className="h-8 w-8 rounded-lg object-cover" /><span className="text-base font-black text-white">{product.game || "Blox Fruit"}</span><span className="text-xs text-slate-400">/ Product details</span></div></div>
      </header>
      <main className="min-h-screen bg-[#07111f] px-4 pb-0 pt-[280px] text-white sm:px-6 lg:px-10">
      <div className="product-page-enter mx-auto max-w-6xl">
        <BackTransitionButton fallbackHref={shopPath} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">← Back to {product.game || "shop"}</BackTransitionButton>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1628] p-6">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 via-[#07111f] to-blue-700/20 p-8">
              {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" /> : <div className="h-32 w-32 rounded-2xl bg-blue-500/30" />}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-700/70 bg-[#0b1628] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-300">{product.category || "General"}</span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${unavailable ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{unavailable ? "Out of stock" : product.stock === "Limited" ? "Limited stock" : "In stock"}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">{product.description || `Digital ${product.category || "gaming"} item for ${product.game || "your game"}.`}</p>
            <div className="mt-7 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-emerald-300">${Number(product.price).toFixed(2)}</span>
              {hasSale && <span className="relative text-sm font-semibold text-slate-500 after:absolute after:left-[-0.1em] after:top-1/2 after:h-px after:w-[calc(100%+0.2em)] after:-rotate-12 after:bg-rose-400/90">${Number(product.compare_at_price).toFixed(2)}</span>}
            </div>
            {product.tag && <p className="mt-3 text-xs font-semibold text-slate-400">{product.tag}</p>}
            <button type="button" onClick={addToCart} disabled={unavailable} className={`mt-7 flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold transition ${unavailable ? "cursor-not-allowed bg-slate-700 text-slate-400" : "bg-blue-500 text-white hover:bg-blue-400"}`}>{unavailable ? "Out of stock" : added ? "Added to cart" : "Add to Cart"}</button>
            {added && <Link href={shopPath} className="mt-3 block text-center text-sm font-semibold text-blue-300 hover:text-blue-200">Return to shop and view cart</Link>}
          </section>
        </div>        {recentProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center gap-3"><span className="h-8 w-1 rounded-full bg-blue-500" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Keep shopping</p><h2 className="text-xl font-black text-white">Recently Viewed Products</h2></div></div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recentProducts.slice(0, 4).map((item) => (
                <PageTransitionLink key={item.id} href={`/products/${encodeURIComponent(item.slug || String(item.id))}`} className="group overflow-hidden rounded-xl border border-slate-700/70 bg-[#0b1628] transition hover:border-blue-400/50">
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-emerald-500/15 via-[#07111f] to-blue-700/20 p-4">{item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-contain transition group-hover:scale-105" /> : <div className="h-16 w-16 rounded-xl bg-blue-500/30" />}</div>
                  <div className="p-3"><h3 className="truncate text-sm font-black text-white">{item.name}</h3><p className="mt-1 text-sm font-extrabold text-emerald-300">${Number(item.price).toFixed(2)}</p></div>
                </PageTransitionLink>
              ))}
            </div>
          </section>
        )}
      </div>
      <footer className="relative mt-14 -mx-4 overflow-hidden border-t border-white/10 sm:-mx-6 lg:-mx-10">
        <img src="/blox-fruit-logo.png" alt="" className="h-[180px] w-full object-cover object-center opacity-75 md:h-[260px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/55 to-[#07111f]/20" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center"><p className="max-w-2xl text-xs leading-6 text-slate-100 md:text-sm">Bloxhop is an independent digital marketplace and is not affiliated with Roblox Corporation or game developers. All game titles, names, trademarks, and assets belong to their respective owners.</p></div>
      </footer>
    </main>
    </>
  );
}














