import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    // 🔥 STEP 1: GET USER ID
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
      cache: "no-store",
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Failed to verify Roblox username." },
        { status: 500 }
      );
    }

    const user = userData?.data?.[0];

    if (!user) {
      return NextResponse.json(
        { error: "Roblox username not found." },
        { status: 404 }
      );
    }

    // 🔥 STEP 2: GET AVATAR
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
      { cache: "no-store" }
    );

    const avatarData = await avatarRes.json();

    let avatarUrl = null;

    if (avatarRes.ok) {
      avatarUrl = avatarData?.data?.[0]?.imageUrl || null;
    }

    // ✅ FINAL RESPONSE
    return NextResponse.json({
      userId: user.id,
      username: user.name,
      displayName: user.displayName || "",
      avatarUrl,
    });

  } catch (error) {
    console.error("ROBLOX VERIFY ERROR:", error);

    return NextResponse.json(
      { error: "Server error while verifying username." },
      { status: 500 }
    );
  }
}