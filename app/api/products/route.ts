import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
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
        image_url
      `)
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 }
    );
  }
}