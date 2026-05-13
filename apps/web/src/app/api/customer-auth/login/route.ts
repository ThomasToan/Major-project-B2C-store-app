import {
  createCustomerSession,
  findCustomerUserByEmail,
} from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { clearCartSessionCookie } from "@/functions/cartSession";
import {
  createCustomerSessionId,
  setCustomerSessionCookie,
} from "@/functions/customerSession";
import { verifyPassword } from "@/functions/password";

export const runtime = "nodejs";

async function readBody(request: NextRequest) {
  try {
    return (await request.json()) as {
      email?: string;
      password?: string;
    };
  } catch {
    return {};
  }
}

function toSafeUser(user: {
  createdAt: Date;
  email: string;
  id: number;
  name: string;
  role: string;
}) {
  return {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await findCustomerUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const sessionId = createCustomerSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await createCustomerSession({
    expiresAt,
    sessionId,
    userId: user.id,
  });

  const response = NextResponse.json({ user: toSafeUser(user) });
  setCustomerSessionCookie(response, sessionId);
  clearCartSessionCookie(response);
  return response;
}
