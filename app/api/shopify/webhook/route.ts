import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing SHOPIFY_WEBHOOK_SECRET.");
  }

  if (!hmacHeader) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return timingSafeEqual(digest, hmacHeader);
}

function extractOrderId(payload: any) {
  const attributes = Array.isArray(payload?.note_attributes)
    ? payload.note_attributes
    : [];

  const noteIdAttr = attributes.find((attr: any) => {
    const key = String(attr?.name || attr?.key || "").toLowerCase();
    return key === "bloxhop_order_id" || key === "order_id";
  });

  const note = String(payload?.note || "");
  const noteMatch = note.match(/order-(\d+)/i);

  return (
    noteIdAttr?.value ||
    noteIdAttr?.val ||
    noteMatch?.[1] ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic") || "";

    console.log("Shopify webhook received", {
      topic,
      hasSignature: Boolean(hmacHeader),
      bodyLength: rawBody.length,
    });

    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.warn("Shopify webhook signature check failed");
      return NextResponse.json(
        { error: "Invalid Shopify webhook signature." },
        { status: 401 },
      );
    }

    if (!topic.toLowerCase().includes("paid")) {
      console.log("Shopify webhook ignored because topic is not paid-related", {
        topic,
      });
      return NextResponse.json({ ok: true, ignored: true });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.warn("Shopify webhook JSON parse failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { ok: true, ignored: true, reason: "invalid-json" },
        { status: 200 },
      );
    }

    const orderId = extractOrderId(payload);

    if (!orderId) {
      console.warn("Shopify webhook missing Bloxhop order reference", {
        topic,
        note: payload?.note || null,
        noteAttributes: payload?.note_attributes || null,
        orderNumber: payload?.order_number || null,
        name: payload?.name || null,
      });
      return NextResponse.json(
        {
          ok: true,
          ignored: true,
          reason: "missing-bloxhop-order-id",
        },
        { status: 200 },
      );
    }

    const paidAt =
      payload?.processed_at ||
      payload?.created_at ||
      new Date().toISOString();
    const totalPrice = Number(
      payload?.current_total_price || payload?.total_price || 0,
    );
    const email = payload?.email || null;
    const financialStatus = String(payload?.financial_status || "").toLowerCase();
    const shopifyOrderNumber = String(
      payload?.order_number || payload?.name || "",
    ).replace(/^#/, "");

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "Paid",
        payment_method: "Shopify",
        paid_at: paidAt,
        payer_email: email,
        xendit_reference_id: shopifyOrderNumber || null,
        status: financialStatus === "paid" ? "Paid" : "Pending",
        total_price: Number.isFinite(totalPrice) ? totalPrice : undefined,
      })
      .eq("id", Number(orderId));

    if (error) {
      console.error("Failed to update Shopify order:", error);
      return NextResponse.json(
        { error: "Failed to update matching order." },
        { status: 500 },
      );
    }

    console.log("Shopify webhook matched and updated admin order", {
      orderId,
      topic,
      financialStatus,
      shopifyOrderNumber: shopifyOrderNumber || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shopify webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process Shopify webhook.",
      },
      { status: 500 },
    );
  }
}
