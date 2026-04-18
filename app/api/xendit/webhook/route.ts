import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

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
      event === "payment_session.completed" || sessionStatus === "COMPLETED";

    const isExpired =
      event === "payment_session.expired" || sessionStatus === "EXPIRED";

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

      for (const item of existingOrder.items ?? []) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (productError || !product) {
          console.error("Failed to load product for stock update:", item.id, productError);
          continue;
        }

        const qty = Number(item.quantity || 1);
        const newStock = Math.max(Number(product.stock_quantity || 0) - qty, 0);

        let stockLabel = "In Stock";
        if (newStock === 0) stockLabel = "Out of Stock";
        else if (newStock <= 3) stockLabel = "Limited";

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            stock: stockLabel,
          })
          .eq("id", item.id);

        if (stockError) {
          console.error("Failed to update stock:", item.id, stockError);
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
              subject: "Your Bloxhop Payment Has Been Confirmed",
              html: `
                <div style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, sans-serif; color:#111;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7; padding:30px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background:linear-gradient(135deg,#111827,#4f46e5); padding:32px 24px; text-align:center;">
                              <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">Bloxhop</h1>
                              <p style="margin:10px 0 0; color:#dbeafe; font-size:14px;">
                                Fast & Trusted Blox Fruits Store
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:32px 24px;">
                              <p style="margin:0 0 16px; font-size:16px;">Hi ${existingOrder.roblox_username},</p>

                              <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#374151;">
                                Your payment has been confirmed and your order is now in our queue.
                              </p>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:24px;">
                                <tr>
                                  <td style="padding:20px;">
                                    <p style="margin:0 0 10px; font-size:14px; color:#6b7280;">Order Details</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Order ID:</strong> ${existingOrder.id}</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Total:</strong> $${Number(existingOrder.total_price).toFixed(2)}</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Payment Status:</strong> Paid</p>
                                    <p style="margin:0; font-size:15px;"><strong>Sent To:</strong> ${email}</p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff; border:1px solid #c7d2fe; border-radius:14px; margin-bottom:18px;">
                                <tr>
                                  <td style="padding:18px 20px;">
                                    <p style="margin:0; font-size:15px; line-height:1.7; color:#312e81;">
                                      Please wait up to <strong>3 hours maximum</strong> for your item to be delivered.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed; border:1px solid #fdba74; border-radius:14px; margin-bottom:24px;">
                                <tr>
                                  <td style="padding:18px 20px;">
                                    <p style="margin:0; font-size:15px; line-height:1.7; color:#9a3412;">
                                      If your item is not delivered after 3 hours, you will be eligible for a refund.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0; font-size:14px; line-height:1.7; color:#6b7280;">
                                Please make sure your contact information is correct so we can reach you if needed.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="border-top:1px solid #e5e7eb; padding:20px 24px; text-align:center; background:#fafafa;">
                              <p style="margin:0 0 6px; font-size:13px; color:#6b7280;">Bloxhop</p>
                              <p style="margin:0; font-size:12px; color:#9ca3af;">
                                This is a transactional email about your order.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
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