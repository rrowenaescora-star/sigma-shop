import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { adminSupabase } from "@/lib/supabase-admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Please log in to upload a screenshot." }, { status: 401 });
  const data = await request.formData(); const file = data.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Upload a PNG, JPG, or WEBP image up to 5 MB." }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "png";
  const path = `customers/${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await adminSupabase.storage.from("support-attachments").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attachmentPath: path });
}