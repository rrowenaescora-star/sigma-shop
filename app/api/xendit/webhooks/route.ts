import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { sendDiscordOrderNotification } from "@/lib/discord";

type XenditWebhookBody = {
  event?: string;
  id?: string;
  reference_id?: string;
  status?: string;
  data?: {
    id?: string;
    reference_id?: string;
    status?: string;
    payment_link_id?: string | null;
    payment_request_id?: string | null;
    payment_token_id?: string | null;
    amount?: number | null;
    currency?: string | null;
    failure_code?: string | null;
    failure_message?: string | null;
    metadata?: Record<string, unknown> | null;
  };
  payment_id?: string | null;
  payment_request_id?: string | null;
  payment_token_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  metadata?: Record<string, unknown> | null;
};

type OrderItem = {
  id: string | number;
  quantity?: number;
};

function isValidEmail(value: string | null | undefined) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: Request) {
  try {
    const callbackToken = req.headers.get("x-callback-token");

    if (!process.env.XENDIT_WEBHOOK_TOKEN) {
      console.error("Missing XENDIT_WEBHOOK_TOKEN in env.");
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid webhook token." }, { status: 401 });
    }

    const body = (await req.json()) as XenditWebhookBody;

    const event = body.event;
    const payload = body.data ?? body;

    const referenceId = payload.reference_id;
    const sessionStatus = payload.status;

    if (!referenceId) {
      return NextResponse.json({ error: "Missing reference_id." }, { status: 400 });
    }

    const { data: existingOrder, error: findError } = await supabase
      .from("orders")
      .select("*")
      .eq("xendit_reference_id", referenceId)
      .single();

    if (findError || !existingOrder) {
      console.error("Order not found for reference_id:", referenceId, findError);
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isCompleted =
      event === "payment_session.completed" ||
      event === "invoice.paid" ||
      sessionStatus === "COMPLETED" ||
      sessionStatus === "PAID";

    const isExpired =
      event === "payment_session.expired" ||
      event === "invoice.expired" ||
      sessionStatus === "EXPIRED";

    if (isCompleted) {
      if (existingOrder.payment_status === "Paid") {
        return NextResponse.json({ received: true, message: "Already processed." });
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "Paid",
          status: "Pending",
          paid_at: new Date().toISOString(),
        })
        .eq("id", existingOrder.id);

      if (updateError) {
        console.error("Failed to mark order paid:", updateError);
        return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
      }

      try {
        await sendDiscordOrderNotification({
          orderId: existingOrder.id,
          robloxUsername: existingOrder.roblox_username,
          contactInfo: existingOrder.contact_info,
          totalPrice: Number(existingOrder.total_price),
          paymentStatus: "Paid",
          deliveryStatus: existingOrder.delivery_status || "Pending",
          paypalOrderId:
            existingOrder.paypal_order_id ||
            existingOrder.xendit_reference_id ||
            null,
        });
      } catch (discordError) {
        console.error("Discord paid order notification failed:", discordError);
      }

      const { data: settings, error: settingsError } = await supabase
        .from("shop_settings")
        .select("id, global_capital")
        .single();

      if (settingsError || !settings) {
        console.error("Failed to load shop settings:", settingsError);
        return NextResponse.json(
          { error: "Failed to load shop settings." },
          { status: 500 }
        );
      }

      let currentCapital = Number(settings.global_capital || 0);

      for (const rawItem of (existingOrder.items ?? []) as OrderItem[]) {
        const itemId = rawItem?.id;
        const qty = Number(rawItem?.quantity || 1);

        if (!itemId) {
          console.error("Order item missing id:", rawItem);
          continue;
        }

        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, stock_quantity, cost_value")
          .eq("id", itemId)
          .single();

        if (productError || !product) {
          console.error("Failed to load product for stock/capital update:", itemId, productError);
          continue;
        }

        const currentStock = Number(product.stock_quantity || 0);
        const newStock = Math.max(currentStock - qty, 0);

        let stockLabel = "In Stock";
        if (newStock === 0) stockLabel = "Out of Stock";
        else if (newStock <= 3) stockLabel = "Limited";

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            stock: stockLabel,
          })
          .eq("id", itemId);

        if (stockError) {
          console.error("Failed to update stock:", itemId, stockError);
        }

        const costValue = Number(product.cost_value || 0);
        currentCapital -= costValue * qty;
      }

      if (currentCapital < 0) {
        currentCapital = 0;
      }

      const { error: capitalUpdateError } = await supabase
        .from("shop_settings")
        .update({
          global_capital: currentCapital,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (capitalUpdateError) {
        console.error("Failed to update global capital:", capitalUpdateError);
        return NextResponse.json(
          { error: "Failed to update global capital." },
          { status: 500 }
        );
      }

      const { data: allProducts, error: allProductsError } = await supabase
        .from("products")
        .select("id, cost_value");

      if (allProductsError) {
        console.error("Failed to load products for availability update:", allProductsError);
        return NextResponse.json(
          { error: "Failed to update product availability." },
          { status: 500 }
        );
      }

      for (const product of allProducts ?? []) {
        const isAvailable = Number(product.cost_value || 0) <= currentCapital;

        const { error: availabilityError } = await supabase
          .from("products")
          .update({
            is_active: isAvailable,
          })
          .eq("id", product.id);

        if (availabilityError) {
          console.error(
            "Failed to update product availability:",
            product.id,
            availabilityError
          );
        }
      }

      const recipients = [existingOrder.payer_email, existingOrder.contact_info]
        .filter((value): value is string => isValidEmail(value))
        .map((value) => value.trim().toLowerCase());

      const uniqueRecipients = [...new Set(recipients)];

      if (uniqueRecipients.length > 0) {
        for (const email of uniqueRecipients) {
          try {
            await sendEmail({
              to: email,
              subject: `Your Blox Shop Order #${existingOrder.id} Payment Was Confirmed`,
             html: `
  <div style="margin:0; padding:0; background:#eaf0ff; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <div style="max-width:720px; margin:0 auto; padding:0; background:#ffffff; overflow:hidden;">

      <img
        src="${process.env.NEXT_PUBLIC_APP_URL}/header-email.png"
        alt="Blox Shop"
        width="720"
        style="display:block; width:100%; max-width:720px; border:0; outline:none; text-decoration:none;"
      />

      <div style="padding:34px 38px 28px 38px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td valign="top">
              <h1 style="margin:0 0 14px 0; font-size:28px; line-height:1.2; color:#111827;">
                Your payment was confirmed!
              </h1>

              <p style="margin:0 0 12px 0; font-size:14px;">
                Hello <b style="color:#f59e0b;">${existingOrder.roblox_username}</b>,
              </p>

              <p style="margin:0; font-size:14px; color:#374151;">
                We received your payment successfully. Your order is now in our delivery queue.
              </p>
            </td>

            <td align="right" valign="top" width="190">
              <a
                href="https://discord.gg/evM2G5c9Vr"
                style="display:inline-block; background:#fb923c; color:#ffffff; padding:15px 22px; border-radius:10px; text-decoration:none; font-weight:900; font-size:15px;"
              >
                Need Help?
              </a>
            </td>
          </tr>
        </table>

        <div style="border:1px solid #e5e7eb; border-radius:14px; padding:18px 20px; margin-bottom:26px; background:#ffffff;">
          <p style="margin:0 0 18px 0; font-size:15px; font-weight:900; color:#111827;">
            ORDER DETAILS
          </p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px; color:#64748b;">Order ID</td>
              <td style="font-size:12px; color:#64748b;">Payment</td>
              <td style="font-size:12px; color:#64748b;">Status</td>
              <td align="right" style="font-size:12px; color:#64748b;">Total</td>
            </tr>

            <tr>
              <td style="padding-top:8px; font-size:18px; font-weight:900; color:#f59e0b;">
                #${existingOrder.id}
              </td>

              <td style="padding-top:8px; font-size:14px; font-weight:700; color:#111827;">
                Xendit
              </td>

              <td style="padding-top:8px;">
                <span style="display:inline-block; background:#ecfdf5; color:#16a34a; border:1px solid #86efac; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;">
                  PAID
                </span>
              </td>

              <td align="right" style="padding-top:8px; font-size:22px; font-weight:900; color:#f59e0b;">
                $${Number(existingOrder.total_price || 0).toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <div style="border:1px solid #c7d2fe; background:#eef2ff; border-radius:12px; padding:16px; margin-bottom:16px;">
          <p style="margin:0; font-size:13px; line-height:1.6; color:#312e81;">
            Please wait up to <b>3 hours maximum</b> for your item to be delivered.
          </p>
        </div>

        <div style="border:1px solid #fed7aa; background:#fff7ed; border-radius:12px; padding:16px; margin-bottom:16px;">
          <p style="margin:0; font-size:13px; line-height:1.6; color:#111827;">
            <b style="color:#f59e0b;">Important:</b>
            If your item is not delivered after 3 hours, you will be eligible for a refund.
          </p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb; padding-top:20px; margin-bottom:10px;">
          <tr>
            <td width="33%" valign="top" style="padding-right:14px;">
              <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">FAST DELIVERY</p>
              <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">We deliver your items as fast as possible.</p>
            </td>

            <td width="33%" valign="top" style="padding:0 14px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">
              <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">SECURE ORDERS</p>
              <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">Your orders are safe and protected.</p>
            </td>

            <td width="33%" valign="top" style="padding-left:14px;">
              <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">24/7 SUPPORT</p>
              <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">Our support team is always here to help.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#050b16; border-top:5px solid #f59e0b; padding:22px 24px; text-align:center; color:#cbd5e1;">
        <p style="margin:0 0 10px 0; font-size:13px;">
          Thank you for ordering from Blox Shop!
        </p>

        <p style="margin:0; font-size:11px; color:#94a3b8;">
          © ${new Date().getFullYear()} Blox Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`,
            });
          } catch (emailError) {
            console.error(`Webhook email failed for ${email}:`, emailError);
          }
        }
      }

      return NextResponse.json({ received: true, message: "Payment completed." });
    }

    if (isExpired) {
      const { error: expireError } = await supabase
        .from("orders")
        .update({
          payment_status: "Expired",
          status: "Cancelled",
        })
        .eq("id", existingOrder.id);

      if (expireError) {
        console.error("Failed to expire order:", expireError);
        return NextResponse.json({ error: "Failed to update expired order." }, { status: 500 });
      }

      return NextResponse.json({ received: true, message: "Payment expired." });
    }

    return NextResponse.json({
      received: true,
      message: `Unhandled event: ${event ?? "unknown"}`,
    });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}