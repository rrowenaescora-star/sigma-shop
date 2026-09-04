import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

const KEYS = ["catalog", "store_info", "faq"] as const;
const SPANS = ["normal", "wide", "large"] as const;
type Key = (typeof KEYS)[number];
type Span = (typeof SPANS)[number];

function isKey(value: unknown): value is Key {
  return typeof value === "string" && KEYS.includes(value as Key);
}

function isSpan(value: unknown): value is Span {
  return typeof value === "string" && SPANS.includes(value as Span);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sections, products] = await Promise.all([
    adminSupabase.from("store_sections").select("*").order("display_order"),
    adminSupabase
      .from("products")
      .select("id,name,image_url,category,is_active,display_order,mobile_display_order,grid_span")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("id"),
  ]);

  if (sections.error || products.error) {
    return NextResponse.json(
      { error: "Run the Store Layout Editor SQL migration first." },
      { status: 503 }
    );
  }

  return NextResponse.json({ sections: sections.data || [], products: products.data || [] });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sections: any[] = Array.isArray(body.sections) ? body.sections : [];
    const products: any[] = Array.isArray(body.products) ? body.products : [];

    if (sections.length !== KEYS.length || new Set(sections.map((item) => item?.section_key)).size !== KEYS.length || !sections.every((item) => isKey(item?.section_key) && typeof item.enabled === "boolean" && Number.isInteger(item.display_order) && item.display_order >= 1)) {
      return NextResponse.json({ error: "The section layout is invalid." }, { status: 400 });
    }

    if (new Set(sections.map((item) => item.display_order)).size !== sections.length) {
      return NextResponse.json({ error: "Sections cannot share the same position." }, { status: 400 });
    }

    if (new Set(products.map((item) => item?.id)).size !== products.length || !products.every((item) => Number.isInteger(item?.id) && Number.isInteger(item.display_order) && item.display_order >= 1 && isSpan(item.grid_span))) {
      return NextResponse.json({ error: "The product layout is invalid." }, { status: 400 });
    }

    if (new Set(products.map((item) => item.display_order)).size !== products.length) {
      return NextResponse.json({ error: "Products cannot share the same position." }, { status: 400 });
    }

    const sectionRows = sections.map((item) => ({
      section_key: item.section_key,
      display_order: item.display_order,
      mobile_display_order: Number.isInteger(item.mobile_display_order) ? item.mobile_display_order : item.display_order,
      enabled: item.enabled,
      settings: typeof item.settings === "object" && item.settings ? item.settings : {},
      updated_at: new Date().toISOString(),
    }));

    const sectionResult = await adminSupabase
      .from("store_sections")
      .upsert(sectionRows, { onConflict: "section_key" });

    if (sectionResult.error) throw sectionResult.error;

    for (const product of products) {
      const update = await adminSupabase
        .from("products")
        .update({
          display_order: product.display_order,
          mobile_display_order: Number.isInteger(product.mobile_display_order) ? product.mobile_display_order : product.display_order,
          grid_span: product.grid_span,
        })
        .eq("id", product.id);

      if (update.error) throw update.error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Store layout save failed:", error);
    return NextResponse.json(
      { error: "Could not save the layout. Your unsaved changes are still here." },
      { status: 500 }
    );
  }
}