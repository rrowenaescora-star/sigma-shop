import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("x-staff-secret");

    if (auth !== process.env.STAFF_UPDATE_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized request.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId = String(body.orderId || "")
      .replace("#", "")
      .trim();

    const action = String(body.action || "").trim();

    if (!orderId || !action) {
      return NextResponse.json({
        success: false,
        message: "Missing orderId or action.",
      });
    }

    let updates: any = {};

    // =========================
    // VERIFY PAYMENT
    // =========================
    if (action === "verify_payment") {
      updates = {
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      };
    }

    // =========================
    // REJECT PAYMENT
    // =========================
    if (action === "reject_payment") {
      updates = {
        payment_status: "rejected",
      };
    }

    // =========================
    // MARK DELIVERING
    // =========================
    if (action === "mark_delivering") {
      updates = {
        delivery_status: "delivering",
      };
    }

    // =========================
    // MARK DELIVERED
    // =========================
    if (action === "mark_delivered") {
      updates = {
        delivery_status: "delivered",
        delivered_at: new Date().toISOString(),
      };
    }

    // =========================
    // CLAIM ORDER
    // =========================
    if (action === "claim_order") {
      updates = {
        claimed_by: body.staffName || "Unknown Staff",
      };
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      console.error(error);

      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order updated with action: ${action}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server error.",
    });
  }
}