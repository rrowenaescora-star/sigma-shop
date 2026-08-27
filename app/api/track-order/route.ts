import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order ID." },
        { status: 400 }
      );
    }

    const normalizedOrderId = orderId.replace(/^#/, "").trim();
    const numericOrderId = Number(normalizedOrderId);

    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("xendit_reference_id", normalizedOrderId)
      .maybeSingle();

    if (!data && Number.isInteger(numericOrderId)) {
      const internalLookup = await supabase
        .from("orders")
        .select("*")
        .eq("id", numericOrderId)
        .maybeSingle();
      data = internalLookup.data;
      error = internalLookup.error;
    }

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const publicOrderId =
      data.payment_method === "Shopify" && data.xendit_reference_id
        ? data.xendit_reference_id
        : data.id;

    return NextResponse.json({
      order: { ...data, public_order_id: publicOrderId },
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: "Failed to track order." },
      { status: 500 }
    );
  }
}