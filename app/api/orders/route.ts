import { sendDiscordOrderNotification } from "@/lib/discord";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({ ok: true, message: "orders route works" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      robloxUsername,
      contactInfo,
      notes,
      items,
      totalPrice,
      paypalOrderId,
      paymentStatus,
      payerEmail,
    } = body;

    if (
      !robloxUsername ||
      !contactInfo ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
      );
    }

    // 🔥 STEP 1: VALIDATE STOCK BEFORE ORDER CREATION
    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `Product not found.` },
          { status: 400 }
        );
      }

      const availableStock = Number(product.stock_quantity || 0);
      const requestedQty = Number(item.quantity || 1);

      if (availableStock < requestedQty) {
        return NextResponse.json(
          {
            error: `${product.name} only has ${availableStock} left in stock.`,
          },
          { status: 400 }
        );
      }
    }

    // 🔥 STEP 2: CREATE ORDER
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: totalPrice,
          status: "Pending",
          paypal_order_id: paypalOrderId ?? null,
          payment_status: paymentStatus ?? "Unpaid",
          payer_email: payerEmail ?? null,
          paid_at: paymentStatus === "Paid" ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔥 STEP 3: REDUCE STOCK SAFELY
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .eq("id", item.id)
        .single();

      if (!product) continue;

      const quantityToReduce = Number(item.quantity || 1);

      const newStock = Math.max(
        Number(product.stock_quantity || 0) - quantityToReduce,
        0
      );

      let stockLabel = "In Stock";
      if (newStock === 0) stockLabel = "Out of Stock";
      else if (newStock <= 3) stockLabel = "Limited";

      await supabase
        .from("products")
        .update({
          stock_quantity: newStock,
          stock: stockLabel,
        })
        .eq("id", item.id);
    }

    // 🔥 STEP 4: DISCORD NOTIFICATION
    await sendDiscordOrderNotification({
      orderId: data.id,
      robloxUsername: data.roblox_username,
      contactInfo: data.contact_info,
      totalPrice: Number(data.total_price),
      paymentStatus: data.payment_status,
      deliveryStatus: data.delivery_status,
      paypalOrderId: data.paypal_order_id,
    });

    return NextResponse.json({ success: true, order: data });

  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order.",
      },
      { status: 500 }
    );
  }
}
