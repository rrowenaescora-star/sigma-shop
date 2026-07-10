import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

function generateAccessCode() {
  return `BH-${crypto.randomInt(100000, 1000000)}`;
}

function hashAccessCode(code: string) {
  const secret = process.env.WALLET_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing WALLET_ACCESS_SECRET");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(code)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get("x-wallet-admin-secret");

    if (
      !process.env.WALLET_ADMIN_SECRET ||
      adminSecret !== process.env.WALLET_ADMIN_SECRET
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const requestId =
      typeof body.requestId === "string" ? body.requestId.trim() : "";

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 },
      );
    }

    const { data: accessRequest, error: requestError } =
      await supabaseAdmin
        .from("wallet_access_requests")
        .select("id, email, status")
        .eq("id", requestId)
        .single();

    if (requestError || !accessRequest) {
      return NextResponse.json(
        { error: "Wallet request was not found." },
        { status: 404 },
      );
    }

    if (accessRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been reviewed." },
        { status: 409 },
      );
    }

    const accessCode = generateAccessCode();
    const accessCodeHash = hashAccessCode(accessCode);
    const reviewedAt = new Date().toISOString();

    const { error: walletError } = await supabaseAdmin
      .from("wallets")
      .upsert(
        {
          email: accessRequest.email,
          balance_centavos: 0,
          status: "active",
          activated: false,
          updated_at: reviewedAt,
        },
        {
          onConflict: "email",
        },
      );

    if (walletError) {
      console.error("Wallet creation error:", walletError);

      return NextResponse.json(
        { error: "Unable to create the wallet." },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("wallet_access_requests")
      .update({
        status: "approved",
        access_code_hash: accessCodeHash,
        reviewed_at: reviewedAt,
        reviewed_by: "wallet-admin",
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Wallet approval error:", updateError);

      return NextResponse.json(
        { error: "Unable to approve the request." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wallet request approved.",
      wallet: {
        email: accessRequest.email,
        accessCode,
      },
    });
  } catch (error) {
    console.error("Wallet approval route error:", error);

    return NextResponse.json(
      { error: "Unable to approve the wallet request." },
      { status: 500 },
    );
  }
}