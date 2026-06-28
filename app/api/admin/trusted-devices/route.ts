import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(value + process.env.ADMIN_OTP_SECRET)
    .digest("hex");
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();

    const cookie = req.headers.get("cookie") || "";
    const trustedCookie = cookie
      .split("; ")
      .find((c) => c.startsWith("bloxhop_trusted_device="))
      ?.split("=")[1];

    const currentDeviceId = trustedCookie?.split(".")[0] || null;

    const { data, error } = await supabase
      .from("admin_trusted_devices")
      .select("id,email,device_name,user_agent,ip,expires_at,revoked,created_at,last_used_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const devices = (data || []).map((device) => ({
      ...device,
      is_current: device.id === currentDeviceId,
    }));

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("GET TRUSTED DEVICES ERROR:", error);
    return NextResponse.json({ error: "Failed to load devices." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { deviceId, revokeAllOthers } = await req.json();

    const supabase = getSupabaseAdmin();

    if (revokeAllOthers) {
      const cookie = req.headers.get("cookie") || "";
      const trustedCookie = cookie
        .split("; ")
        .find((c) => c.startsWith("bloxhop_trusted_device="))
        ?.split("=")[1];

      const currentDeviceId = trustedCookie?.split(".")[0];

      if (!currentDeviceId) {
        return NextResponse.json({ error: "Current device not found." }, { status: 400 });
      }

      const { error } = await supabase
        .from("admin_trusted_devices")
        .update({ revoked: true })
        .neq("id", currentDeviceId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId." }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_trusted_devices")
      .update({ revoked: true })
      .eq("id", deviceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });

    const cookie = req.headers.get("cookie") || "";
    const trustedCookie = cookie
      .split("; ")
      .find((c) => c.startsWith("bloxhop_trusted_device="))
      ?.split("=")[1];

    const currentDeviceId = trustedCookie?.split(".")[0];

    if (currentDeviceId === deviceId) {
      response.cookies.delete("bloxhop_trusted_device");
      response.cookies.delete("bloxhop_otp_verified");
    }

    return response;
  } catch (error) {
    console.error("DELETE TRUSTED DEVICE ERROR:", error);
    return NextResponse.json({ error: "Failed to revoke device." }, { status: 500 });
  }
}