import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
<<<<<<< HEAD
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
=======
      .select(
        "id, name, slug, price, tag, stock, stock_quantity, category, description, image_url"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
<<<<<<< HEAD
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 }
    );
  }
}
=======
    console.error("Products route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
