import { deleteCustomerSession } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { clearCartSessionCookie } from "@/functions/cartSession";
import {
  clearCustomerSessionCookie,
  getCustomerSessionId,
} from "@/functions/customerSession";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionId = getCustomerSessionId(request);

  if (sessionId) {
    await deleteCustomerSession(sessionId);
  }

  const response = NextResponse.json({ success: true });
  clearCustomerSessionCookie(response);
  clearCartSessionCookie(response);
  return response;
}
