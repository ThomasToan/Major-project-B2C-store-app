import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/functions/customerSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCustomerFromRequest(request);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
    },
  });
}
