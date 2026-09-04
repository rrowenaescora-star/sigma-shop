import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const fields = "id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game,display_order,mobile_display_order,grid_span";

    let result: any = await supabase
      .from("products")
      .select(fields, { count: "exact" })
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });

    // The shop remains usable while the new layout migration is waiting to be run.
    if (result.error && /display_order|grid_span|mobile_display_order/i.test(result.error.message || "")) {
      result = await supabase
        .from("products")
        .select("id,name,slug,price,compare_at_price,cost_value,tag,stock,stock_quantity,category,description,image_url,is_active,game", { count: "exact" })
        .eq("is_active", true)
        .order("id", { ascending: true });
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