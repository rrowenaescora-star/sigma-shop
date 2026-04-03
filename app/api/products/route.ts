import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, price, tag, stock, stock_quantity, category, description, image_url"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("Products route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
