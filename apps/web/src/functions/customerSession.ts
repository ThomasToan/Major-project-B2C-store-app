import { randomUUID } from "node:crypto";
import { getCustomerBySessionId } from "@repo/db/store";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const CUSTOMER_SESSION_COOKIE = "customer_session_id";

export function createCustomerSessionId() {
  return randomUUID();
}

export function getCustomerSessionId(request: NextRequest) {
  return request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value.trim();
}

export async function getCustomerFromRequest(request: NextRequest) {
  const sessionId = getCustomerSessionId(request);

  if (!sessionId) {
    return undefined;
  }

  return getCustomerBySessionId(sessionId);
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value.trim();

  if (!sessionId) {
    return undefined;
  }

  return getCustomerBySessionId(sessionId);
}

export function setCustomerSessionCookie(
  response: NextResponse,
  sessionId: string,
) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearCustomerSessionCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
