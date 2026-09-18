import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const keyword = String(query || "").trim();
    if (keyword.length < 3 || keyword.length > 20) return NextResponse.json({ error: "Enter at least 3 username characters." }, { status: 400 });

    const usersResponse = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(keyword)}&limit=10`, { cache: "no-store" });
    if (!usersResponse.ok) return NextResponse.json({ error: "Roblox search is temporarily unavailable." }, { status: 502 });
    const usersData = await usersResponse.json();
    const users = Array.isArray(usersData?.data) ? usersData.data.slice(0, 10) : [];
    if (!users.length) return NextResponse.json({ users: [] });

    const ids = users.map((user: any) => Number(user.id)).filter(Number.isFinite);
    const thumbnailsResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids.join(",")}&size=150x150&format=Png&isCircular=false`, { cache: "no-store" });
    const thumbnailsData = thumbnailsResponse.ok ? await thumbnailsResponse.json() : { data: [] };
    const thumbnails = new Map((thumbnailsData.data || []).map((item: any) => [Number(item.targetId), item.imageUrl]));

    return NextResponse.json({ users: users.map((user: any) => ({ id: Number(user.id), username: String(user.name), displayName: String(user.displayName || ""), avatarUrl: thumbnails.get(Number(user.id)) || null })) });
  } catch {
    return NextResponse.json({ error: "Roblox search is temporarily unavailable." }, { status: 500 });
  }
}