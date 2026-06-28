import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(value + process.env.ADMIN_OTP_SECRET)
    .digest("hex");
}

function getDeviceName(userAgent: string) {
  if (userAgent.includes("iPhone")) return "iPhone";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("Windows")) return "Windows PC";
  if (userAgent.includes("Mac")) return "Mac";
  return "Unknown Device";
}

export async function POST(req: Request) {
  try {
    const { email, otp, trustDevice } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const otpHash = hashValue(otp);

    const { data: otpRow, error } = await supabase
      .from("admin_otps")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp_hash", otpHash)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRow) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    await supabase
      .from("admin_otps")
      .update({ used: true })
      .eq("id", otpRow.id);

    const response = NextResponse.json({ success: true });

    response.cookies.set("bloxhop_otp_verified", "true", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    });

    if (trustDevice) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashValue(rawToken);
      const userAgent = req.headers.get("user-agent") || "";
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

	const { data: existingDevice } = await supabase
  .from("admin_trusted_devices")
  .select("id")
  .eq("email", email.toLowerCase())
  .eq("user_agent", userAgent)
  .eq("ip", ip)
  .eq("revoked", false)
  .maybeSingle();

      let deviceId: string | null = null;

if (existingDevice) {
  await supabase
    .from("admin_trusted_devices")
    .update({
      device_token_hash: tokenHash,
      expires_at: expiresAt,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", existingDevice.id);

  deviceId = existingDevice.id;
} else {
  const { data: device } = await supabase
    .from("admin_trusted_devices")
    .insert({
      email: email.toLowerCase(),
      device_token_hash: tokenHash,
      device_name: getDeviceName(userAgent),
      user_agent: userAgent,
      ip,
      expires_at: expiresAt,
      last_used_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  deviceId = device?.id ?? null;
}

      if (deviceId) {
        response.cookies.set("bloxhop_trusted_device", `${deviceId}.${rawToken}`, {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }
    }

    return response;
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}