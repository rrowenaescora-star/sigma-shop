import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDiscordDeliveredNotification } from "@/lib/discord";

// ✅ GET ORDERS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

// ✅ UPDATE ORDER
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, status, deliveryStatus, deliveryNotes, handledBy } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing order ID." },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) updateData.status = status;
    if (deliveryStatus) updateData.delivery_status = deliveryStatus;
    if (deliveryNotes !== undefined)
      updateData.delivery_notes = deliveryNotes;
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
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 🔥 Discord notify
    if (data.delivery_status === "Delivered") {
      await sendDiscordDeliveredNotification({
        orderId: data.id,
        robloxUsername: data.roblox_username,
        contactInfo: data.contact_info,
        totalPrice: Number(data.total_price),
        deliveryStatus: data.delivery_status,
        deliveryNotes: data.delivery_notes,
        handledBy: data.handled_by,
      });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}
