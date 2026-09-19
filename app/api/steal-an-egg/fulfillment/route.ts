import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PAYPAL_GUEST_COOKIE, guestSessionsMatch } from "@/lib/paypal-guest-session";
import { deductCapitalForPaidOrder } from "@/lib/capital";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function ownedPaidOrder(orderId: number) {
  const token = (await cookies()).get(PAYPAL_GUEST_COOKIE)?.value;
  const { data } = await supabase.from("orders").select("id,roblox_username,items,payment_status,delivery_status,delivery_notes,notes,checkout_session_hash,payment_provider,xendit_session_id").eq("id", orderId).in("payment_provider", ["paypal", "paymongo"]).single();
  if (!data || !guestSessionsMatch(token, data.checkout_session_hash) || !String(data.notes || "").startsWith("STEAL_AN_EGG")) return null;
  return data;
}

async function reconcilePayMongoPayment(order: Awaited<ReturnType<typeof ownedPaidOrder>>) {
  if (!order || order.payment_provider !== "paymongo" || order.payment_status === "Paid" || !order.xendit_session_id || !process.env.PAYMONGO_SECRET_KEY) return order;
  try {
    const auth = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(order.xendit_session_id)}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
    if (!response.ok) return order;
    const checkout = await response.json();
    const session = checkout?.data;
    const attributes = session?.attributes;
    const payment = Array.isArray(attributes?.payments) ? attributes.payments.find((entry: any) => entry?.attributes?.status === "paid") : null;
    const expectedCentavos = Number(attributes?.metadata?.php_amount_centavos);
    const paidCentavos = Number(payment?.attributes?.amount);
    const verified = session?.id === order.xendit_session_id && attributes?.livemode === true && attributes?.payment_intent?.attributes?.status === "succeeded" && Number(attributes?.metadata?.order_id) === order.id && Number.isInteger(expectedCentavos) && expectedCentavos >= 100 && paidCentavos === expectedCentavos && String(payment?.attributes?.currency || "").toUpperCase() === "PHP";
    if (!verified) return order;
    const paidAt = payment?.attributes?.paid_at ? new Date(Number(payment.attributes.paid_at) * 1000).toISOString() : new Date().toISOString();
    const { error } = await supabase.from("orders").update({ payment_status: "Paid", status: "Pending", paid_amount: paidCentavos / 100, paid_currency: "PHP", paid_at: paidAt, payment_method: "PayMongo" }).eq("id", order.id).eq("xendit_session_id", session.id).neq("payment_status", "Paid");
    if (error) return order;
    await deductCapitalForPaidOrder(Number(order.id));
    return { ...order, payment_status: "Paid" };
  } catch {
    return order;
  }
}
export async function GET(request: Request) {
  const orderId = Number(new URL(request.url).searchParams.get("orderId"));
  if (!Number.isInteger(orderId) || orderId < 1) return NextResponse.json({ error: "Order not found." }, { status: 400 });
  const order = await reconcilePayMongoPayment(await ownedPaidOrder(orderId));
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  let invitationUrl: string | null = null;
  try {
    const candidate = new URL(String(order.delivery_notes || ""));
    if (candidate.protocol === "https:" && (candidate.hostname === "roblox.com" || candidate.hostname.endsWith(".roblox.com"))) invitationUrl = candidate.toString();
  } catch {}
  return NextResponse.json({ orderId: order.id, paid: order.payment_status === "Paid", username: order.roblox_username === "Pending after payment" ? null : order.roblox_username, deliveryStatus: order.delivery_status || "Pending", invitationUrl });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const orderId = Number(body.orderId);
    if (!Number.isInteger(orderId) || orderId < 1) return NextResponse.json({ error: "Order not found." }, { status: 400 });
    const order = await reconcilePayMongoPayment(await ownedPaidOrder(orderId));
    if (!order || order.payment_status !== "Paid") return NextResponse.json({ error: "Payment must be confirmed first." }, { status: 403 });

    if (body.action === "select-account") {
      const userId = Number(body.userId);
      if (!Number.isInteger(userId) || userId < 1) return NextResponse.json({ error: "Select a valid Roblox account." }, { status: 400 });
      const response = await fetch(`https://users.roblox.com/v1/users/${userId}`, { cache: "no-store" });
      if (!response.ok) return NextResponse.json({ error: "That Roblox account could not be verified." }, { status: 400 });
      const user = await response.json();
      const username = String(user.name || "").trim();
      if (!username) return NextResponse.json({ error: "That Roblox account could not be verified." }, { status: 400 });
      const notes = `STEAL_AN_EGG_FULFILLMENT\nRoblox user id: ${userId}\nDisplay name: ${String(user.displayName || "").slice(0, 80)}`;
      const { error } = await supabase.from("orders").update({ roblox_username: username, notes, delivery_status: "Account selected" }).eq("id", orderId).eq("checkout_session_hash", order.checkout_session_hash);
      if (error) return NextResponse.json({ error: "Could not save the selected account." }, { status: 500 });
      return NextResponse.json({ success: true, username, deliveryStatus: "Account selected" });
    }

    if (body.action === "friend-request-sent") {
      if (!order.roblox_username || order.roblox_username === "Pending after payment") return NextResponse.json({ error: "Select your Roblox account first." }, { status: 400 });
      const { error } = await supabase.from("orders").update({ delivery_status: "Friend request awaiting verification" }).eq("id", orderId).eq("checkout_session_hash", order.checkout_session_hash);
      if (error) return NextResponse.json({ error: "Could not update the request status." }, { status: 500 });
      return NextResponse.json({ success: true, deliveryStatus: "Friend request awaiting verification" });
    }

    return NextResponse.json({ error: "Unsupported fulfillment action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not update fulfillment." }, { status: 500 });
  }
}