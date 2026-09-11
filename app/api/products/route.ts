import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PRODUCT_FIELDS = "id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game,display_order,mobile_display_order,grid_span";
const LEGACY_PRODUCT_FIELDS = "id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const game = searchParams.get("game")?.trim();
    const ids = (searchParams.get("ids") || "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0).slice(0, 12);
    let query = supabase.from("products").select(PRODUCT_FIELDS, { count: "exact" }).eq("is_active", true);
    if (game) query = query.eq("game", game);
    if (ids.length) query = query.in("id", ids);

    let result: any = await query.order("display_order", { ascending: true, nullsFirst: false }).order("id", { ascending: true });

    // The shop remains usable while the new layout migration is waiting to be run.
    if (result.error && /display_order|grid_span|mobile_display_order/i.test(result.error.message || "")) {
      let legacyQuery = supabase.from("products").select(LEGACY_PRODUCT_FIELDS, { count: "exact" }).eq("is_active", true);
      if (game) legacyQuery = legacyQuery.eq("game", game);
      if (ids.length) legacyQuery = legacyQuery.in("id", ids);
      result = await legacyQuery.order("id", { ascending: true });
    }

    if (result.error) {
      console.error("GET /api/products supabase error:", result.error);
      return NextResponse.json({ error: result.error.message || "Failed to load products." }, { status: 500 });
    }

    return NextResponse.json({ products: result.data || [], count: result.count ?? 0 });
  } catch (error) {
    console.error("GET /api/products server error:", error);
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}
