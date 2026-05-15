import { NextResponse } from "next/server";
import { sendDiscordItemRequest } from "@/lib/discord";

const requestMap = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    const lastRequest = requestMap.get(ip);
    const now = Date.now();

    if (lastRequest && now - lastRequest < 60_000) {
      return NextResponse.json(
        { error: "Please wait before sending another request." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const {
      robloxUsername,
      game,
      itemWanted,
      budget,
      contactInfo,
      extraNotes,
      website,
    } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!robloxUsername || !game || !itemWanted || !contactInfo) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (
      String(robloxUsername).length < 3 ||
      String(game).length < 2 ||
      String(itemWanted).length < 3 ||
      String(contactInfo).length < 3
    ) {
      return NextResponse.json(
        { error: "Some fields are too short." },
        { status: 400 }
      );
    }

    if (
      String(robloxUsername).length > 40 ||
      String(game).length > 40 ||
      String(itemWanted).length > 100 ||
      String(contactInfo).length > 100 ||
      String(extraNotes || "").length > 500
    ) {
      return NextResponse.json(
        { error: "Some fields are too long." },
        { status: 400 }
      );
    }

    requestMap.set(ip, now);

    await sendDiscordItemRequest({
      robloxUsername,
      game,
      itemWanted,
      budget,
      contactInfo,
      extraNotes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REQUEST ITEM ERROR:", error);

    return NextResponse.json(
      { error: "Failed to submit request." },
      { status: 500 }
    );
  }
}