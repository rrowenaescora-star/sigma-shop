import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { robloxUsername, contactInfo, notes, items, totalPrice } = body;

    if (
      !robloxUsername ||
      !contactInfo ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: totalPrice,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}