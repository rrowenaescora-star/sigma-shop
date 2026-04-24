import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error, count } = await supabase
      .from("products")
      .select(
        `
          id,
          name,
          slug,
          price,
          compare_at_price,
          tag,
          stock,
          stock_quantity,
          category,
          description,
          image_url,
          is_active
        `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("GET /api/products supabase error:", error);

      return NextResponse.json(
        {
          error: error.message || "Failed to load products.",
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data || [],
      count: count ?? 0,
    });
  } catch (error) {
    console.error("GET /api/products server error:", error);

    return NextResponse.json(
      {
        error: "Failed to load products.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}