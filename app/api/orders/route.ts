import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      robloxUsername,
      robloxUserId,
      robloxDisplayName,
      contactInfo,
      notes,
      items,
      totalPrice,
      xenditSessionId,
      xenditReferenceId,
      paymentMethod,
      paymentStatus,
      payerEmail,
      couponCode,
      couponDiscount,
      originalTotal,
    } = body;

    if (!robloxUsername || !contactInfo || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required order information." },
        { status: 400 }
      );
    }

    // LOAD SHOP CAPITAL
    const { data: settings, error: settingsError } = await supabase
      .from("shop_settings")
      .select("global_capital")
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: "Failed to load shop capital." },
        { status: 500 }
      );
    }

    const globalCapital = Number(settings.global_capital || 0);

    // LOAD PRODUCTS FROM DATABASE
    const itemIds = items.map((item: any) => item.id);

    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, cost_value")
      .in("id", itemIds);

    if (productsError) {
      return NextResponse.json(
        { error: "Failed to validate products." },
        { status: 500 }
      );
    }

    // CAPITAL VALIDATION
    for (const cartItem of items) {
      const dbProduct = dbProducts?.find(
        (p) => Number(p.id) === Number(cartItem.id)
      );

      if (!dbProduct) {
        return NextResponse.json(
          {
            error: `Product not found for item ID ${cartItem.id}.`,
          },
          { status: 400 }
        );
      }

      const requiredCapital =
        Number(dbProduct.cost_value || cartItem.price || 0) *
        Number(cartItem.quantity || 1);

      if (globalCapital < requiredCapital) {
        return NextResponse.json(
          {
            error: `${dbProduct.name} is currently unavailable.`,
          },
          { status: 400 }
        );
      }
    }

    // SAVE ORDER
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        roblox_username: robloxUsername,
        contact_info: contactInfo,
        notes: notes || "",
        items,
        total_price: Number(totalPrice || 0),
        xendit_session_id: xenditSessionId || null,
        xendit_reference_id: xenditReferenceId || null,
        payment_method: paymentMethod || "Manual Order",
        payment_status: paymentStatus || "Pending",
        payer_email: payerEmail || null,
        status: "Pending",
        coupon_code: couponCode || null,
        coupon_discount: couponDiscount || 0,
        original_total: originalTotal || totalPrice,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Order insert error:", error);

      return NextResponse.json(
        { error: error.message || "Order save failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order route error:", error);

    return NextResponse.json(
      { error: "Server error while saving order." },
      { status: 500 }
    );
  }
}