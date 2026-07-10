import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeAccessCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
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

function hashesMatch(first: string, second: string) {
  const firstBuffer = Buffer.from(first, "hex");
  const secondBuffer = Buffer.from(second, "hex");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body?.email);
    const accessCode = normalizeAccessCode(body?.accessCode);

    if (!email || !accessCode) {
      return NextResponse.json(
        {
          error: "Email and access code are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data: accessRequest, error: accessRequestError } =
      await supabaseAdmin
        .from("wallet_access_requests")
        .select("id, email, access_code_hash, status")
        .eq("email", email)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (accessRequestError) {
      console.error(
        "Wallet activation request lookup error:",
        accessRequestError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify wallet access.",
        },
        {
          status: 500,
        },
      );
    }

    if (!accessRequest) {
      return NextResponse.json(
        {
          error: "No wallet access request was found for this email.",
        },
        {
          status: 404,
        },
      );
    }

    if (accessRequest.status !== "approved") {
      return NextResponse.json(
        {
          error: "This wallet request has not been approved yet.",
        },
        {
          status: 403,
        },
      );
    }

    const submittedCodeHash = hashValue(accessCode);

    if (
      !accessRequest.access_code_hash ||
      !hashesMatch(
        submittedCodeHash,
        accessRequest.access_code_hash,
      )
    ) {
      return NextResponse.json(
        {
          error: "The access code is incorrect.",
        },
        {
          status: 401,
        },
      );
    }

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, email, status, activated")
      .eq("email", email)
      .maybeSingle();

    if (walletError) {
      console.error("Wallet activation lookup error:", walletError);

      return NextResponse.json(
        {
          error: "Unable to load this wallet.",
        },
        {
          status: 500,
        },
      );
    }

    if (!wallet) {
      return NextResponse.json(
        {
          error: "The approved wallet has not been created yet.",
        },
        {
          status: 404,
        },
      );
    }

    if (wallet.status !== "active") {
      return NextResponse.json(
        {
          error: "This wallet is currently unavailable.",
        },
        {
          status: 403,
        },
      );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionTokenHash = hashValue(sessionToken);
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("wallet_sessions")
      .insert({
        wallet_id: wallet.id,
        token_hash: sessionTokenHash,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error("Wallet session creation error:", sessionError);

      return NextResponse.json(
        {
          error: "Unable to create the wallet session.",
        },
        {
          status: 500,
        },
      );
    }

    if (!wallet.activated) {
      const { error: activationError } = await supabaseAdmin
        .from("wallets")
        .update({
          activated: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      if (activationError) {
        console.error("Wallet activation update error:", activationError);

        return NextResponse.json(
          {
            error: "Unable to activate this wallet.",
          },
          {
            status: 500,
          },
        );
      }
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
    console.error("Wallet activation route error:", error);

    return NextResponse.json(
      {
        error: "Unable to activate the wallet.",
      },
      {
        status: 500,
      },
    );
  }
}