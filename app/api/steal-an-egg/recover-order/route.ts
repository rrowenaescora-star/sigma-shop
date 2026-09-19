import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGuestCheckoutSession, guestSessionsMatch, PAYPAL_GUEST_COOKIE } from "@/lib/paypal-guest-session";

export const runtime = "nodejs";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = Number(body.orderId);
    const email = normalizeEmail(body.email);
    if (!Number.isInteger(orderId) || orderId < 1 || (email && !emailPattern.test(email))) {
      return NextResponse.json({ error: "Enter a valid order number and payment email." }, { status: 400 });
    }

    const { data: order } = await supabase.from("orders").select("id,payment_provider,payment_status,payer_email,contact_info,xendit_session_id,notes,checkout_session_hash").eq("id", orderId).in("payment_provider", ["paypal", "paymongo"]).single();
    if (!order || !String(order.notes || "").startsWith("STEAL_AN_EGG")) {
      return NextResponse.json({ error: "We could not verify those order details." }, { status: 404 });
    }

    const currentToken = (await cookies()).get(PAYPAL_GUEST_COOKIE)?.value;
    const sameBrowser = guestSessionsMatch(currentToken, order.checkout_session_hash);
    let verified = false;
    if (order.payment_provider === "paypal") {
      verified = order.payment_status === "Paid" && (sameBrowser || Boolean(email && [order.payer_email, order.contact_info].some((value) => normalizeEmail(value) === email)));
    } else if (order.payment_provider === "paymongo" && order.xendit_session_id && process.env.PAYMONGO_SECRET_KEY) {
      const auth = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");
      const paymongoResponse = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(order.xendit_session_id)}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
      if (paymongoResponse.ok) {
        const checkout = await paymongoResponse.json();
        const session = checkout?.data;
        const attributes = session?.attributes;
        const payment = Array.isArray(attributes?.payments) ? attributes.payments.find((entry: any) => entry?.attributes?.status === "paid") : null;
        const paymentEmail = normalizeEmail(attributes?.billing?.email || attributes?.customer_email || payment?.attributes?.billing?.email);
        verified = session?.id === order.xendit_session_id && attributes?.livemode === true && attributes?.payment_intent?.attributes?.status === "succeeded" && Number(attributes?.metadata?.order_id) === order.id && (sameBrowser || Boolean(email && paymentEmail && paymentEmail === email));
      }
    }

    if (!verified) return NextResponse.json({ error: email ? "That email does not match the payment record. If you paid without providing an email, contact Bloxhop support for manual recovery." : "Enter the payment email if you provided one. If you paid without email, use the original payment browser or contact Bloxhop support for manual recovery." }, { status: 404 });

    const session = createGuestCheckoutSession();
    const update: Record<string, string> = { checkout_session_hash: session.hash };
    if (!order.payer_email && email) update.payer_email = email;
    const { error } = await supabase.from("orders").update(update).eq("id", order.id);
    if (error) return NextResponse.json({ error: "Order access could not be restored. Please try again." }, { status: 500 });

    const response = NextResponse.json({ success: true, redirectUrl: `/steal-an-egg/order?orderId=${order.id}&provider=${order.payment_provider}` });
    response.cookies.set(PAYPAL_GUEST_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return response;
  } catch {
    return NextResponse.json({ error: "Order access could not be restored. Please try again." }, { status: 500 });
  }
}