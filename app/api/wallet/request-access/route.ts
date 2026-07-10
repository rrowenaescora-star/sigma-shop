import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateAccessCode() {
  const randomNumber = crypto.randomInt(100000, 1000000);
  return `BH-${randomNumber}`;
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

async function sendWalletRequestToDiscord(params: {
  email: string;
  accessCode: string;
  requestId: string;
  createdAt: string;
}) {
  const webhookUrl =
    process.env.DISCORD_REQUEST_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "Wallet request saved, but no Discord webhook URL is configured.",
    );
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "Bloxhop Wallet",
      content: "New wallet access request received.",
      embeds: [
        {
          title: "Wallet Access Request",
          color: 3447003,
          fields: [
            {
              name: "Email",
              value: params.email,
              inline: false,
            },
            {
              name: "Access Code",
              value: params.accessCode,
              inline: true,
            },
            {
              name: "Request ID",
              value: params.requestId,
              inline: false,
            },
            {
              name: "Status",
              value: "Pending",
              inline: true,
            },
            {
              name: "Requested At",
              value: params.createdAt,
              inline: false,
            },
          ],
          footer: {
            text: "Bloxhop Wallet Approval System",
          },
          timestamp: params.createdAt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      `Wallet Discord notification failed: ${response.status} ${errorText}`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data: recentRequest, error: recentRequestError } =
      await supabaseAdmin
        .from("wallet_access_requests")
        .select("id")
        .eq("email", email)
        .gte("created_at", oneMinuteAgo)
        .maybeSingle();

    if (recentRequestError) {
      console.error(
        "Failed to check recent wallet request:",
        recentRequestError,
      );

      return NextResponse.json(
        {
          error: "Unable to process the request.",
        },
        {
          status: 500,
        },
      );
    }

    if (recentRequest) {
      return NextResponse.json(
        {
          error:
            "A request was recently submitted for this email. Please wait before trying again.",
        },
        {
          status: 429,
        },
      );
    }

    const { data: existingRequest, error: existingRequestError } =
      await supabaseAdmin
        .from("wallet_access_requests")
        .select("id, status")
        .eq("email", email)
        .in("status", ["pending", "approved"])
        .maybeSingle();

    if (existingRequestError) {
      console.error(
        "Failed to check existing wallet request:",
        existingRequestError,
      );

      return NextResponse.json(
        {
          error: "Unable to check the wallet request.",
        },
        {
          status: 500,
        },
      );
    }

    if (existingRequest?.status === "pending") {
      return NextResponse.json(
        {
          error: "This email already has a pending wallet request.",
        },
        {
          status: 409,
        },
      );
    }

    if (existingRequest?.status === "approved") {
      return NextResponse.json(
        {
          error: "This email is already approved for Bloxhop Wallet.",
        },
        {
          status: 409,
        },
      );
    }

    const accessCode = generateAccessCode();
    const accessCodeHash = hashAccessCode(accessCode);
    const createdAt = new Date().toISOString();

    const { data: walletRequest, error: insertError } = await supabaseAdmin
      .from("wallet_access_requests")
      .insert({
        email,
        access_code_hash: accessCodeHash,
        status: "pending",
        created_at: createdAt,
      })
      .select("id, email, status, created_at")
      .single();

    if (insertError || !walletRequest) {
      console.error("Failed to create wallet request:", insertError);

      return NextResponse.json(
        {
          error: "Failed to create the wallet access request.",
        },
        {
          status: 500,
        },
      );
    }

    await sendWalletRequestToDiscord({
      email,
      accessCode,
      requestId: walletRequest.id,
      createdAt: walletRequest.created_at,
    });

    return NextResponse.json({
      success: true,
      message:
        "Your wallet request was submitted. Keep your access code safe while waiting for approval.",
      request: {
        email: walletRequest.email,
        status: walletRequest.status,
        accessCode,
      },
    });
  } catch (error) {
    console.error("Wallet request access error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while submitting your request.",
      },
      {
        status: 500,
      },
    );
  }
}