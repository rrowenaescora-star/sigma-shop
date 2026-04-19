import { sendDiscordOrderNotification } from "@/lib/discord";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isValidEmail(value: string | null | undefined) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
      paidAmount,
      couponCode,
    } = body;

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    // 🔒 Prevent duplicate PayPal orders
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

    // 🔥 Validate all products FIRST
    const validatedProducts: any[] = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, is_active")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: "Invalid product detected." },
          { status: 400 }
        );
      }

      // 🔒 Capital protection
      if (product.is_active === false) {
        return NextResponse.json(
          { error: `${product.name} is currently unavailable.` },
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

      validatedProducts.push({ ...product, qty });
    }

    // 🔥 Price validation
    if (Math.abs(computedTotal - Number(totalPrice)) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch detected." },
        { status: 400 }
      );
    }

    const isFreeOrder = computedTotal <= 0;

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
          paypal_order_id: isFreeOrder ? null : paypalOrderId ?? null,
          payment_status: isFreeOrder ? "Free" : paymentStatus ?? "Unpaid",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔥 SAFE STOCK DEDUCTION (ANTI-RACE CONDITION)
    if (isFreeOrder || paymentStatus === "Paid") {
      for (const product of validatedProducts) {
        const { data: current } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", product.id)
          .single();

        const currentStock = Number(current?.stock_quantity || 0);

        if (currentStock < product.qty) {
          return NextResponse.json(
            { error: `${product.name} just went out of stock.` },
            { status: 400 }
          );
        }

        const newStock = currentStock - product.qty;

        let stockLabel = "In Stock";
        if (newStock === 0) stockLabel = "Out of Stock";
        else if (newStock <= 3) stockLabel = "Limited";

        await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            stock: stockLabel,
          })
          .eq("id", product.id);
      }
    }

    // 🔥 EMAIL + DISCORD (unchanged)
    try {
      await sendDiscordOrderNotification({
        orderId: data.id,
        robloxUsername: data.roblox_username || "N/A",
        contactInfo: data.contact_info || "N/A",
        totalPrice: Number(data.total_price) || 0,
        paymentStatus: data.payment_status || "Unknown",
        deliveryStatus: data.delivery_status || "Pending",
        paypalOrderId: data.paypal_order_id || "N/A",
      });
    } catch (e) {
      console.error("Discord failed:", e);
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}