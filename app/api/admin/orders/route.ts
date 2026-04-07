import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendDiscordDeliveredNotification } from "@/lib/discord";

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

// ✅ GET ORDERS
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
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
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

// ✅ UPDATE ORDER
export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { id, status, deliveryStatus, deliveryNotes, handledBy } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing order ID." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;
    if (deliveryStatus) updateData.delivery_status = deliveryStatus;
    if (deliveryNotes !== undefined) {
      updateData.delivery_notes = deliveryNotes;
    }
    if (handledBy !== undefined) {
      updateData.handled_by = handledBy;
    }

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
    console.error("Admin orders PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}
