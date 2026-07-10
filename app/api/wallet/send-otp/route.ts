import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashOtp(otp: string) {
  const secret = process.env.WALLET_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing WALLET_ACCESS_SECRET");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data: recentOtp, error: recentOtpError } =
      await supabaseAdmin
        .from("wallet_otps")
        .select("id")
        .eq("email", email)
        .gte("created_at", oneMinuteAgo)
        .maybeSingle();

    if (recentOtpError) {
      console.error("Wallet OTP lookup error:", recentOtpError);

      return NextResponse.json(
        { error: "Unable to send the verification code." },
        { status: 500 },
      );
    }

    if (recentOtp) {
      return NextResponse.json(
        {
          error:
            "A code was recently sent. Please wait one minute before trying again.",
        },
        { status: 429 },
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("wallet_otps")
      .insert({
        email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.error("Wallet OTP insert error:", insertError);

      return NextResponse.json(
        { error: "Unable to create the verification code." },
        { status: 500 },
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
      from: `"Bloxhop Wallet" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Bloxhop Wallet verification code",
      text: `Your Bloxhop Wallet verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.`,
    });

    return NextResponse.json({
      success: true,
      message: "A verification code was sent to your email.",
    });
  } catch (error) {
    console.error("Wallet send OTP error:", error);

    return NextResponse.json(
      { error: "Unable to send the verification code." },
      { status: 500 },
    );
  }
}