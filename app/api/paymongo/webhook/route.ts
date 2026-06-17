import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("PAYMONGO WEBHOOK RECEIVED");
    console.log(JSON.stringify(body, null, 2));

    const eventType = body?.data?.attributes?.type;
    const paymentData = body?.data?.attributes?.data;

    if (eventType !== "payment.paid") {
      return NextResponse.json({
        received: true,
        message: `Ignored event: ${eventType || "unknown"}`,
      });
    }

    const description = paymentData?.attributes?.description || "";
    const referenceId = description.match(/ORD-\d+/)?.[0];

    if (!referenceId) {
      return NextResponse.json(
        { error: "Missing PayMongo order reference." },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: findError } = await supabase
      .from("orders")
      .select("*")
      .eq("xendit_reference_id", referenceId)
      .single();

    if (findError || !existingOrder) {
      console.error("Order not found:", referenceId, findError);
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (existingOrder.payment_status === "Paid") {
      return NextResponse.json({
        received: true,
        message: "Already processed.",
      });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "Paid",
        status: "Pending",
        paid_at: new Date().toISOString(),
        payment_method: "PayMongo",
        payer_email:
          paymentData?.attributes?.billing?.email ||
          existingOrder.payer_email ||
          existingOrder.contact_info,
      })
      .eq("id", existingOrder.id);

    if (updateError) {
      console.error("Failed to mark order paid:", updateError);
      return NextResponse.json(
        { error: "Failed to update order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      received: true,
      message: "PayMongo payment marked as paid.",
    });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}