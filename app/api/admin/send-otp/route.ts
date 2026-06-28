import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(value + process.env.ADMIN_OTP_SECRET)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const adminOtpEmail = process.env.ADMIN_OTP_EMAIL;

    if (!adminOtpEmail) {
      return NextResponse.json(
        { error: "ADMIN_OTP_EMAIL is not configured." },
        { status: 500 }
      );
    }

    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!allowedAdmins.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: "Unauthorized admin email." },
        { status: 403 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashValue(otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    console.log("SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("SUPABASE URL EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);

const { data, error } = await supabase
  .from("admin_otps")
  .insert({
    email: email.toLowerCase(),
    otp_hash: otpHash,
    expires_at: expiresAt,
  })
  .select();

console.log("OTP INSERT DATA:", data);
console.log("OTP INSERT ERROR:", error);

if (error) {
  return NextResponse.json(
    {
      error: error.message,
    },
    {
      status: 500,
    }
  );
}

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sigma Shop Admin" <${process.env.EMAIL_USER}>`,
      to: adminOtpEmail,
      subject: "Your Sigma Shop Admin OTP",
      text: `Admin login requested for: ${email}\n\nYour Sigma Shop admin verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}