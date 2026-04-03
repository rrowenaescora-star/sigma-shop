import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDiscordDeliveredNotification } from "@/lib/discord";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch orders error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error("Admin orders GET route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch orders.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, deliveryStatus, deliveryNotes, handledBy } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (existingOrderError || !existingOrder) {
      console.error("Fetch existing order error:", existingOrderError);
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (deliveryStatus !== undefined) {
      updateData.delivery_status = deliveryStatus;
    }

    if (deliveryNotes !== undefined) {
      updateData.delivery_notes = deliveryNotes;
    }

    if (handledBy !== undefined) {
      updateData.handled_by = handledBy;
    }

    if (deliveryStatus === "Delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    if (
      deliveryStatus === "Processing" ||
      deliveryStatus === "Pending" ||
      deliveryStatus === "Cancelled"
    ) {
      updateData.delivered_at = null;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update order error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const wasPreviouslyDelivered = existingOrder.delivery_status === "Delivered";
    const isNowDelivered = data.delivery_status === "Delivered";

    if (!wasPreviouslyDelivered && isNowDelivered) {
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
        console.error("Discord delivered notification error:", discordError);
      }
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Admin orders PATCH route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update order.",
      },
      { status: 500 }
    );
  }
}
