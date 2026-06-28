import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(value + process.env.ADMIN_OTP_SECRET)
    .digest("hex");
}

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const trustedCookie = cookie
    .split("; ")
    .find((c) => c.startsWith("bloxhop_trusted_device="))
    ?.split("=")[1];

  if (!trustedCookie) {
    return NextResponse.json({ trusted: false });
  }

  const [deviceId, rawToken] = trustedCookie.split(".");

  if (!deviceId || !rawToken) {
    return NextResponse.json({ trusted: false });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const tokenHash = hashValue(rawToken);

  const { data: device } = await supabase
    .from("admin_trusted_devices")
    .select("id")
    .eq("id", deviceId)
    .eq("device_token_hash", tokenHash)
    .eq("revoked", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!device) {
    return NextResponse.json({ trusted: false });
  }

  await supabase
    .from("admin_trusted_devices")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", deviceId);

  const response = NextResponse.json({ trusted: true });

  response.cookies.set("bloxhop_otp_verified", "true", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}