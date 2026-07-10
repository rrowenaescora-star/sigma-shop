import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeOtp(value: unknown) {
  return String(value ?? "").trim();
}

function hashValue(value: string) {
  const secret = process.env.WALLET_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing WALLET_ACCESS_SECRET");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body?.email);
    const otp = normalizeOtp(body?.otp);

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Enter a valid email and 6-digit code." },
        { status: 400 },
      );
    }

    const otpHash = hashValue(otp);

    const { data: otpRow, error: otpError } = await supabaseAdmin
      .from("wallet_otps")
      .select("id")
      .eq("email", email)
      .eq("otp_hash", otpHash)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("Wallet OTP lookup error:", otpError);

      return NextResponse.json(
        { error: "Unable to verify the code." },
        { status: 500 },
      );
    }

    if (!otpRow) {
      return NextResponse.json(
        { error: "The verification code is invalid or expired." },
        { status: 400 },
      );
    }

    const { error: useOtpError } = await supabaseAdmin
      .from("wallet_otps")
      .update({ used: true })
      .eq("id", otpRow.id)
      .eq("used", false);

    if (useOtpError) {
      console.error("Wallet OTP update error:", useOtpError);

      return NextResponse.json(
        { error: "Unable to complete verification." },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("wallet_otps")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    const { data: existingWallet, error: walletLookupError } =
      await supabaseAdmin
        .from("wallets")
        .select("id, status, activated")
        .eq("email", email)
        .maybeSingle();

    if (walletLookupError) {
      console.error("Wallet lookup error:", walletLookupError);

      return NextResponse.json(
        { error: "Unable to load the wallet." },
        { status: 500 },
      );
    }

    let walletId: string;

    if (existingWallet) {
      if (
        existingWallet.status === "disabled" ||
        existingWallet.status === "suspended"
      ) {
        return NextResponse.json(
          { error: "This wallet is currently unavailable." },
          { status: 403 },
        );
      }

      walletId = existingWallet.id;

      if (
        existingWallet.status !== "active" ||
        !existingWallet.activated
      ) {
        const { error: updateWalletError } = await supabaseAdmin
          .from("wallets")
          .update({
            status: "active",
            activated: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", walletId);

        if (updateWalletError) {
          console.error("Wallet activation error:", updateWalletError);

          return NextResponse.json(
            { error: "Unable to activate the wallet." },
            { status: 500 },
          );
        }
      }
    } else {
      const { data: newWallet, error: createWalletError } =
        await supabaseAdmin
          .from("wallets")
          .insert({
            email,
            balance_centavos: 0,
            status: "active",
            activated: true,
          })
          .select("id")
          .single();

      if (createWalletError || !newWallet) {
        console.error("Wallet creation error:", createWalletError);

        return NextResponse.json(
          { error: "Unable to create the wallet." },
          { status: 500 },
        );
      }

      walletId = newWallet.id;
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashValue(sessionToken);
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("wallet_sessions")
      .insert({
        wallet_id: walletId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error("Wallet session creation error:", sessionError);

      return NextResponse.json(
        { error: "Unable to create the wallet session." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      redirectTo: "/wallet/dashboard",
    });

    response.cookies.set("bloxhop_wallet_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Wallet OTP verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify the wallet." },
      { status: 500 },
    );
  }
}