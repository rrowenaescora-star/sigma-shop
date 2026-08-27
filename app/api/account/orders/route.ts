import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to view your orders." }, { status: 401 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("id, items, total_price, payment_status, status, created_at, payment_method, xendit_reference_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Account orders lookup failed:", error.message);
    return NextResponse.json({ error: "We could not load your orders." }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}