import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { capturePaypalOrder, getPaypalOrder, type PaypalOrder } from "@/lib/paypal";
import { finalizeVerifiedPaypalPayment } from "@/lib/paypal-payment";
import { PAYPAL_GUEST_COOKIE, guestSessionsMatch } from "@/lib/paypal-guest-session";

export const runtime = "nodejs";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    if (!orderID || typeof orderID !== "string") return NextResponse.json({ error: "Payment could not be completed. Please try again." }, { status: 400 });
    const session = (await cookies()).get(PAYPAL_GUEST_COOKIE)?.value;
    const { data: local } = await supabase.from("orders").select("id,total_price,checkout_session_hash,notes").eq("paypal_order_id", orderID).eq("payment_provider", "paypal").single();
    if (!local || !String(local.notes || "").startsWith("STEAL_AN_EGG") || !guestSessionsMatch(session, local.checkout_session_hash)) return NextResponse.json({ error: "This payment does not belong to this checkout session." }, { status: 403 });

    let paypalOrder: PaypalOrder;
    try {
      paypalOrder = await capturePaypalOrder(orderID);
    } catch {
      paypalOrder = await getPaypalOrder(orderID);
      if (paypalOrder.status === "APPROVED") return NextResponse.json({ error: "PayPal declined the selected funding source. In Sandbox, use another test PayPal account or test card and try again." }, { status: 402 });
      return NextResponse.json({ error: "PayPal could not capture this payment. Please try another payment method." }, { status: 402 });
    }

    const unit = paypalOrder.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (paypalOrder.status !== "COMPLETED" || capture?.status !== "COMPLETED" || !capture.id || capture.amount?.value !== Number(local.total_price).toFixed(2) || capture.amount.currency_code !== "USD" || String(unit?.reference_id || unit?.custom_id) !== String(local.id)) return NextResponse.json({ error: "Payment could not be verified. Please try again." }, { status: 409 });

    const result = await finalizeVerifiedPaypalPayment({ orderId: Number(local.id), paypalOrderId: orderID, captureId: capture.id, amount: capture.amount.value, currency: capture.amount.currency_code, payerEmail: paypalOrder.payer?.email_address, paidAt: capture.create_time });
    if (!result.finalized && !result.already_paid) return NextResponse.json({ error: "Payment could not be finalized. Please contact support." }, { status: 409 });
    return NextResponse.json({ success: true, bloxhopOrderId: local.id });
  } catch {
    return NextResponse.json({ error: "Payment could not be completed. Please try again." }, { status: 500 });
  }
}