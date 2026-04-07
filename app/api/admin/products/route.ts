import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();

  // 🔥 ONLY ALLOW YOUR EMAIL
  if (!user || user.email !== process.env.ADMIN_EMAILS) {
    return null;
  }

  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      .maybeSingle();

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
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      return NextResponse.json(
        { error: "Missing product ID." },
        { status: 400 }
      );
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

export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin products DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
