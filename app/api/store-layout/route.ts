import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("store_sections")
    .select("section_key,display_order,mobile_display_order,enabled,settings")
    .order("display_order");

  if (error) {
    return NextResponse.json({ sections: [] }, { status: 200 });
  }

  return NextResponse.json({ sections: data || [] });
}