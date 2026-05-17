import {
  createCustomerSession,
  createCustomerUser,
  findCustomerUserByEmail,
} from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { clearCartSessionCookie } from "@/functions/cartSession";
import {
  createCustomerSessionId,
  setCustomerSessionCookie,
} from "@/functions/customerSession";
import { hashPassword } from "@/functions/password";

export const runtime = "nodejs";

async function readBody(request: NextRequest) {
  try {
    return (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "";

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { message: "Name, email, and a 6 character password are required." },
      { status: 400 },
    );
  }

  const existingUser = await findCustomerUserByEmail(email);

  if (existingUser) {
    return NextResponse.json(
      { message: "An account already exists for this email." },
      { status: 409 },
    );
  }

  const user = await createCustomerUser({
    email,
    name,
    passwordHash: await hashPassword(password),
  });
  const sessionId = createCustomerSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await createCustomerSession({
    expiresAt,
    sessionId,
    userId: user.id,
  });

  const response = NextResponse.json({ user }, { status: 201 });
  setCustomerSessionCookie(response, sessionId);
  clearCartSessionCookie(response);
  return response;
}
