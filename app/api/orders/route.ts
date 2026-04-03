import { sendDiscordOrderNotification } from "@/lib/discord";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
      paidAmount,
    } = body;

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (paypalOrderId) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("paypal_order_id", paypalOrderId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Duplicate payment detected." },
          { status: 400 }
        );
      }
    }

    let computedTotal = 0;

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: "Invalid product detected." },
          { status: 400 }
        );
      }

      const qty = Number(item.quantity || 1);
      const stock = Number(product.stock_quantity || 0);

      if (qty <= 0 || qty > stock) {
        return NextResponse.json(
          { error: `${product.name} has insufficient stock.` },
          { status: 400 }
        );
      }

      computedTotal += Number(product.price) * qty;
    }

    if (Math.abs(computedTotal - Number(totalPrice)) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch detected." },
        { status: 400 }
      );
    }

    const isPaidOrder =
      paymentStatus === "Paid" || paymentStatus === "COMPLETED";

    if (paypalOrderId || isPaidOrder) {
      if (paidAmount === undefined || paidAmount === null) {
        return NextResponse.json(
          { error: "Missing verified PayPal payment amount." },
          { status: 400 }
        );
      }

      if (Math.abs(computedTotal - Number(paidAmount)) > 0.01) {
        return NextResponse.json(
          { error: "Verified PayPal payment amount does not match order total." },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: computedTotal,
          status: "Pending",
          paypal_order_id: paypalOrderId ?? null,
          payment_status: isPaidOrder ? "Paid" : paymentStatus ?? "Unpaid",
          payer_email: payerEmail ?? null,
          paid_at: isPaidOrder ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (isPaidOrder) {
      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (!product) continue;

        const qty = Number(item.quantity || 1);

        const newStock = Math.max(
          Number(product.stock_quantity || 0) - qty,
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
    }

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
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
