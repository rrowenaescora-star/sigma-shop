import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashSessionToken(token: string) {
  const secret = process.env.WALLET_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing WALLET_ACCESS_SECRET");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(token)
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

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, status, activated")
      .eq("email", email)
      .maybeSingle();

    if (walletError) {
      console.error("Wallet lookup error:", walletError);

      return NextResponse.json(
        { error: "Unable to check this wallet." },
        { status: 500 },
      );
    }

    if (!wallet) {
      return NextResponse.json({
        status: "otp",
      });
    }

    if (
      wallet.status === "disabled" ||
      wallet.status === "suspended"
    ) {
      return NextResponse.json(
        { error: "This wallet is currently unavailable." },
        { status: 403 },
      );
    }

    if (!wallet.activated || wallet.status !== "active") {
      return NextResponse.json({
        status: "otp",
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("wallet_sessions")
      .insert({
        wallet_id: wallet.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error("Wallet session creation error:", sessionError);

      return NextResponse.json(
        { error: "Unable to open this wallet." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      status: "dashboard",
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
    console.error("Wallet email check error:", error);

    return NextResponse.json(
      { error: "Unable to check this email." },
      { status: 500 },
    );
  }
}