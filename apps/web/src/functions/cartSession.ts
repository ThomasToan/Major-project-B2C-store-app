import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const CART_SESSION_COOKIE = "cart_session_id";

export function getCartSession(request: NextRequest) {
  const existingSessionId = request.cookies
    .get(CART_SESSION_COOKIE)
    ?.value.trim();

  if (existingSessionId) {
    return {
      isNew: false,
      sessionId: existingSessionId,
    };
  }

  return {
    isNew: true,
    sessionId: randomUUID(),
  };
}

export function setCartSessionCookie(
  response: NextResponse,
  sessionId: string,
) {
  response.cookies.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
