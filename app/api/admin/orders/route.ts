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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const headerUrl = `${appUrl}/header-email.png`;
        const fallbackImage = `${appUrl}/logo.png`;
        const discordLink = "https://discord.gg/evM2G5c9Vr";

        const orderDate = data.created_at
          ? new Date(data.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Today";

        const deliveredDate = data.delivered_at
          ? new Date(data.delivered_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Today";

        const itemsHtml = (data.items || [])
          .map((item: any) => {
            const itemImage =
              item.image_url || item.imageUrl || item.image || fallbackImage;

            const itemName = item.name || item.title || "Purchased Item";
            const itemQty = item.quantity || item.qty || 1;
            const itemPrice = Number(item.price || item.total || 0).toFixed(2);

            return `
              <div style="border:1px solid #e5e7eb; border-radius:14px; padding:14px; margin-bottom:12px; background:#ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="62" valign="middle">
                      <img
                        src="${itemImage}"
                        alt="${itemName}"
                        width="52"
                        height="52"
                        style="display:block; border-radius:10px; object-fit:cover; background:#0f172a; border:0;"
                      />
                    </td>

                    <td valign="middle" style="padding-left:12px;">
                      <p style="margin:0; font-size:14px; font-weight:800; color:#111827;">
                        ${itemName}
                      </p>

                      <p style="margin:6px 0 0 0; font-size:12px; color:#64748b;">
                        Quantity: ${itemQty}
                      </p>
                    </td>

                    <td align="right" valign="middle" style="font-size:16px; font-weight:900; color:#f59e0b;">
                      $${itemPrice}
                    </td>
                  </tr>
                </table>
              </div>
            `;
          })
          .join("");

        const html = `
          <div style="margin:0; padding:0; background:#eaf0ff; font-family:Arial, Helvetica, sans-serif; color:#111827;">
            <div style="max-width:720px; margin:0 auto; padding:0; background:#ffffff; overflow:hidden;">

              <img
                src="${headerUrl}"
                alt="Blox Shop"
                width="720"
                style="display:block; width:100%; max-width:720px; border:0; outline:none; text-decoration:none;"
              />

              <div style="padding:34px 38px 28px 38px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td valign="top">
                      <h1 style="margin:0 0 14px 0; font-size:28px; line-height:1.2; color:#111827;">
                        Your order has been delivered!
                      </h1>

                      <p style="margin:0 0 12px 0; font-size:14px;">
                        Hello <b style="color:#f59e0b;">${data.roblox_username}</b>,
                      </p>

                      <p style="margin:0; font-size:14px; color:#374151;">
                        Your Blox Shop order was successfully delivered. Thank you for shopping with us!
                      </p>
                    </td>

                    <td align="right" valign="top" width="190">
                      <a
                        href="${discordLink}"
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
                      <td style="font-size:12px; color:#64748b;">Order Date</td>
                      <td style="font-size:12px; color:#64748b;">Status</td>
                      <td align="right" style="font-size:12px; color:#64748b;">Total</td>
                    </tr>

                    <tr>
                      <td style="padding-top:8px; font-size:18px; font-weight:900; color:#f59e0b;">
                        #${data.id}
                      </td>

                      <td style="padding-top:8px; font-size:14px; font-weight:700; color:#111827;">
                        ${orderDate}
                      </td>

                      <td style="padding-top:8px;">
                        <span style="display:inline-block; background:#ecfdf5; color:#16a34a; border:1px solid #86efac; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;">
                          DELIVERED
                        </span>
                      </td>

                      <td align="right" style="padding-top:8px; font-size:22px; font-weight:900; color:#f59e0b;">
                        $${Number(data.total_price || 0).toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="border:1px solid #86efac; background:#f0fdf4; border-radius:12px; padding:16px; margin-bottom:22px;">
                  <p style="margin:0; font-size:13px; line-height:1.6; color:#166534;">
                    <b>Delivered on:</b> ${deliveredDate}
                  </p>
                </div>

                <div style="margin-bottom:22px;">
                  <p style="margin:0 0 14px 0; font-size:16px; font-weight:900; color:#111827;">
                    DELIVERED ITEMS
                  </p>

                  ${
                    itemsHtml ||
                    `<p style="font-size:14px; color:#64748b;">No item details found.</p>`
                  }
                </div>

                <div style="border:1px solid #fed7aa; background:#fff7ed; border-radius:12px; padding:16px; margin-bottom:16px;">
                  <p style="margin:0; font-size:13px; line-height:1.6; color:#111827;">
                    <b style="color:#f59e0b;">Thank you!</b>
                    Your order is now complete. If you need help, please contact us through Discord.
                  </p>
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb; padding-top:20px; margin-bottom:10px;">
                  <tr>
                    <td width="33%" valign="top" style="padding-right:14px;">
                      <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                        FAST DELIVERY
                      </p>
                      <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                        We deliver your items as fast as possible.
                      </p>
                    </td>

                    <td width="33%" valign="top" style="padding:0 14px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">
                      <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                        SECURE ORDERS
                      </p>
                      <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                        Your orders are safe and protected.
                      </p>
                    </td>

                    <td width="33%" valign="top" style="padding-left:14px;">
                      <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                        24/7 SUPPORT
                      </p>
                      <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                        Our support team is always here to help.
                      </p>
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
        `;

        try {
          const results = await sendEmailsIndividually({
            recipients: uniqueRecipients,
            subject: `Your Blox Shop Order #${data.id} Has Been Delivered`,
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