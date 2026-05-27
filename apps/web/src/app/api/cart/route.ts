import { getCartByUserId } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/functions/customerSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);

  if (!customer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getCartByUserId(customer.id));
}
