import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const eventType = body?.data?.attributes?.type;
    const checkoutSession =
      body?.data?.attributes?.data ||
      body?.data?.attributes?.payment_intent ||
      body?.data?.attributes;

    console.log("PayMongo webhook:", JSON.stringify(body, null, 2));

    if (eventType !== "checkout_session.payment.paid") {
      return NextResponse.json({ received: true, message: "Ignored event." });
    }

    const referenceId =
      checkoutSession?.attributes?.reference_number ||
      checkoutSession?.reference_number;

    if (!referenceId) {
      return NextResponse.json(
        { error: "Missing reference number." },
        { status: 400 }
      );
    }

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("*")
      .eq("xendit_reference_id", referenceId)
      .single();

    if (findError || !order) {
      console.error("Order not found:", referenceId);
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.payment_status === "Paid") {
      return NextResponse.json({ received: true, message: "Already paid." });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "Paid",
        status: "Pending",
        paid_at: new Date().toISOString(),
        payment_method: "PayMongo",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
    }

    return NextResponse.json({ received: true, message: "Payment marked as paid." });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}