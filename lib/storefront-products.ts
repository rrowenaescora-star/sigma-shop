import "server-only";

import { supabase } from "@/lib/supabase";

export type StorefrontProduct = {
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
  grid_span?: "normal" | "wide" | "large" | null;
};

const PRODUCT_FIELDS = "id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game,display_order,mobile_display_order,grid_span";

export async function getStorefrontProducts(game: string): Promise<StorefrontProduct[]> {
  const current = await supabase.from("products").select(PRODUCT_FIELDS).eq("is_active", true).eq("game", game).order("display_order", { ascending: true, nullsFirst: false }).order("id", { ascending: true });
  let rows = current.data as unknown as StorefrontProduct[] | null;
  let queryError = current.error;

  if (queryError && /display_order|grid_span|mobile_display_order/i.test(queryError.message || "")) {
    const legacy = await supabase.from("products").select("id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game").eq("is_active", true).eq("game", game).order("id", { ascending: true });
    rows = legacy.data as unknown as StorefrontProduct[] | null;
    queryError = legacy.error;
  }

  if (queryError) {
    console.error(`Failed to load ${game} products:`, queryError);
    return [];
  }

  return rows || [];
}
export async function getStorefrontProduct(key: string): Promise<StorefrontProduct | null> {
  const base = () => supabase.from("products").select(PRODUCT_FIELDS).eq("is_active", true);
  const numericId = Number(key);
  const result = Number.isInteger(numericId) && numericId > 0
    ? await base().eq("id", numericId).maybeSingle()
    : await base().eq("slug", key).maybeSingle();

  if (result.error) {
    console.error(`Failed to load product ${key}:`, result.error);
    return null;
  }

  return result.data as StorefrontProduct | null;
}
export type StorefrontBootstrap = {
  products: StorefrontProduct[];
  capital: number | null;
  phpRate: number | null;
  inrRate: number | null;
};

async function getExchangeRates() {
  try {
    const response = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP,INR", { next: { revalidate: 3600 } });
    if (!response.ok) return { phpRate: null, inrRate: null };
    const data = await response.json() as { rates?: { PHP?: number; INR?: number } };
    return { phpRate: Number(data.rates?.PHP) || null, inrRate: Number(data.rates?.INR) || null };
  } catch {
    return { phpRate: null, inrRate: null };
  }
}

export async function getStorefrontBootstrap(game: string): Promise<StorefrontBootstrap> {
  const [products, settings, rates] = await Promise.all([
    getStorefrontProducts(game),
    supabase.from("shop_settings").select("global_capital").single(),
    getExchangeRates(),
  ]);

  return {
    products,
    capital: settings.data ? Number(settings.data.global_capital) : null,
    ...rates,
  };
}
export async function getLandingFeaturedImages(): Promise<Record<string, string>> {
  const names = ["Black Dragon", "Ice Serpent", "Unicorn"];
  const { data, error } = await supabase.from("products").select("name,image_url").in("name", names).eq("is_active", true);
  if (error) {
    console.error("Failed to load landing featured images:", error);
    return {};
  }
  return Object.fromEntries((data || []).filter((product) => product.image_url).map((product) => [String(product.name).trim().toLowerCase(), String(product.image_url)]));
}
