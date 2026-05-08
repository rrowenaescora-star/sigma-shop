import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("shop_settings")
      .select("id, global_capital, updated_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to load shop settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const globalCapital = Number(body.global_capital);

    if (!Number.isFinite(globalCapital) || globalCapital < 0) {
      return NextResponse.json(
        { error: "Invalid global capital value." },
        { status: 400 }
      );
    }

    const { data: settings, error: loadError } = await supabase
      .from("shop_settings")
      .select("id")
      .single();

    if (loadError || !settings) {
      return NextResponse.json(
        { error: "Failed to load shop settings row." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("shop_settings")
      .update({
        global_capital: globalCapital,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update shop settings." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      global_capital: globalCapital,
    });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}