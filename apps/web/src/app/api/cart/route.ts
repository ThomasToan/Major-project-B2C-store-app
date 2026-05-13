import { getCartBySessionId, getOrCreateCartBySessionId } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCartSession, setCartSessionCookie } from "@/functions/cartSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { sessionId } = getCartSession(request);

  await getOrCreateCartBySessionId(sessionId);

  const response = NextResponse.json(await getCartBySessionId(sessionId));
  setCartSessionCookie(response, sessionId);

  return response;
}
