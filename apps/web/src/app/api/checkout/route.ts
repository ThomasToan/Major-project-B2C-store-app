import { CheckoutError, checkoutUserCart } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/functions/customerSession";

export const runtime = "nodejs";

type CheckoutBody = {
  name?: unknown;
  email?: unknown;
  cardNumber?: unknown;
  expiry?: unknown;
  cvv?: unknown;
};

async function readJsonBody(request: NextRequest): Promise<CheckoutBody> {
  try {
    return (await request.json()) as CheckoutBody;
  } catch {
    return {};
  }
}

function toRequiredString(value: unknown) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue || undefined;
}

function normalizeCardNumber(value: string) {
  return value.replace(/[\s-]/g, "");
}

function isMockPaymentApproved(cardNumber: string) {
  return normalizeCardNumber(cardNumber) === "4242424242424242";
}

function checkoutErrorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { message: "Checkout could not be completed." },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);

  if (!customer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody(request);
  const name = toRequiredString(body.name);
  const email = toRequiredString(body.email);
  const cardNumber = toRequiredString(body.cardNumber);
  const expiry = toRequiredString(body.expiry);
  const cvv = toRequiredString(body.cvv);

  if (!name || !email || !cardNumber || !expiry || !cvv) {
    return NextResponse.json(
      { message: "Please complete all checkout fields." },
      { status: 400 },
    );
  }

  if (!isMockPaymentApproved(cardNumber)) {
    return NextResponse.json(
      { message: "Payment declined by mock gateway." },
      { status: 402 },
    );
  }

  try {
    const purchase = await checkoutUserCart(customer.id);

    return NextResponse.json({
      purchaseId: purchase.id,
      totalAmount: purchase.totalAmount,
    });
  } catch (error) {
    return checkoutErrorResponse(error);
  }
}
