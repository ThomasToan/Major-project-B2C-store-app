import { togglePostLikeInDatabase } from "@repo/db/store";
import { NextResponse } from "next/server";

function getUserIP(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [firstIP] = forwardedFor.split(",");
    return firstIP?.trim() || "127.0.0.1";
  }

  const realIP = request.headers.get("x-real-ip");
  return realIP?.trim() || "127.0.0.1";
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { urlId?: string };
  const urlId = body.urlId?.trim();

  if (!urlId) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const result = await togglePostLikeInDatabase(urlId, getUserIP(request));

  if (!result) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    liked: result.liked,
    likes: result.post.likes,
  });
}
