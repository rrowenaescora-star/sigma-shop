import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error("Admin orders route error:", error);
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
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}
