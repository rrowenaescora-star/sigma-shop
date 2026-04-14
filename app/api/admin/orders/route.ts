import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendDiscordDeliveredNotification } from "@/lib/discord";
import { sendEmailsIndividually } from "@/lib/email";

function isValidEmail(value: string | null | undefined) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function requireAdmin() {
  const cookieStore = await cookies();

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error) {
    console.error("Admin auth getUser error:", error.message);
    return null;
  }

  const admins =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];

  if (!user || (admins.length > 0 && !admins.includes(user.email ?? ""))) {
    return null;
  }

  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, deliveryStatus, deliveryNotes, handledBy } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;
    if (deliveryStatus) updateData.delivery_status = deliveryStatus;
    if (deliveryNotes !== undefined) updateData.delivery_notes = deliveryNotes;
    if (handledBy !== undefined) updateData.handled_by = handledBy;

    if (deliveryStatus === "Delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.delivery_status === "Delivered") {
      try {
        await sendDiscordDeliveredNotification({
          orderId: data.id,
          robloxUsername: data.roblox_username,
          contactInfo: data.contact_info,
          totalPrice: Number(data.total_price),
          deliveryStatus: data.delivery_status,
          deliveryNotes: data.delivery_notes,
          handledBy: data.handled_by,
        });
      } catch (discordError) {
        console.error("Discord delivered notification failed:", discordError);
      }

      const recipients = [data.payer_email, data.contact_info]
        .filter((value): value is string => isValidEmail(value))
        .map((value) => value.trim().toLowerCase());

      const uniqueRecipients = [...new Set(recipients)];

      const shouldSendDeliveryEmail =
        uniqueRecipients.length > 0 && !data.delivery_email_sent_at;

      if (shouldSendDeliveryEmail) {
        const contactInfoText = data.contact_info
          ? String(data.contact_info)
          : "N/A";
        const sentToText = uniqueRecipients.join(", ");

        const deliveryNotesHtml = data.delivery_notes
          ? `
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff6ff; border:1px solid #93c5fd; border-radius:14px; margin-bottom:24px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 6px; font-size:14px; color:#1d4ed8;">Delivery Notes</p>
                  <p style="margin:0; font-size:15px; line-height:1.7; color:#1e3a8a;">
                    ${String(data.delivery_notes)}
                  </p>
                </td>
              </tr>
            </table>
          `
          : "";

        const html = `
          <div style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, sans-serif; color:#111;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7; padding:30px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#111827,#16a34a); padding:32px 24px; text-align:center;">
                        <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">Bloxhop</h1>
                        <p style="margin:10px 0 0; color:#dcfce7; font-size:14px;">
                          Your order has been delivered
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:32px 24px;">
                        <p style="margin:0 0 16px; font-size:16px;">Hi ${String(data.roblox_username)},</p>

                        <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#374151;">
                          Your order has been successfully delivered 🎉
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px;">
                              <p style="margin:0 0 10px; font-size:14px; color:#6b7280;">Delivery Details</p>
                              <p style="margin:0 0 8px; font-size:15px;"><strong>Order ID:</strong> ${String(data.id)}</p>
                              <p style="margin:0 0 8px; font-size:15px;"><strong>Contact Info:</strong> ${contactInfoText}</p>
                              <p style="margin:0; font-size:15px;"><strong>Sent To:</strong> ${sentToText}</p>
                            </td>
                          </tr>
                        </table>

                        ${deliveryNotesHtml}

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4; border:1px solid #86efac; border-radius:14px;">
                          <tr>
                            <td style="padding:18px 20px;">
                              <p style="margin:0; font-size:15px; line-height:1.7; color:#166534;">
                                Thank you for choosing <strong>Bloxhop</strong> 💜
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="border-top:1px solid #e5e7eb; padding:20px 24px; text-align:center; background:#fafafa;">
                        <p style="margin:0 0 6px; font-size:13px; color:#6b7280;">Bloxhop</p>
                        <p style="margin:0; font-size:12px; color:#9ca3af;">
                          This is a transactional email confirming delivery.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `;

        try {
          const results = await sendEmailsIndividually({
            recipients: uniqueRecipients,
            subject: "Your Bloxhop Order Has Been Delivered",
            html,
          });

          const anySent = results.some((result) => result.ok);

          if (anySent) {
            const { error: emailFlagError } = await supabase
              .from("orders")
              .update({
                delivery_email_sent_at: new Date().toISOString(),
              })
              .eq("id", data.id);

            if (emailFlagError) {
              console.error(
                "Failed to save delivery_email_sent_at:",
                emailFlagError
              );
            }
          }

          console.log("Delivery email results:", results);
        } catch (emailError) {
          console.error("Delivery email batch failed:", emailError);
        }
      } else if (data.delivery_email_sent_at) {
        console.log("Delivery email already sent for this order.");
      } else {
        console.log("No valid email found for this order.");
      }
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}