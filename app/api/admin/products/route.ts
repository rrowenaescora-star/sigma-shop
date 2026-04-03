import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      price,
      tag,
      stock,
      category,
      description,
      imageUrl,
      isActive,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name and price are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          slug: slug || null,
          price,
          tag: tag || null,
          stock: stock || "In Stock",
          category: category || null,
          description: description || null,
          image_url: imageUrl || null,
          is_active: isActive ?? true,
        },
      ])
      .select()
      ..maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      slug,
      price,
      tag,
      stock,
      category,
      description,
      imageUrl,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        slug,
        price,
        tag,
        stock,
        category,
        description,
        image_url: imageUrl,
        is_active: isActive,
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Admin products PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}
