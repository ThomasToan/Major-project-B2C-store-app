import {
  addProductToUserCart,
  removeUserCartItem,
  updateUserCartItemQuantity,
} from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/functions/customerSession";

export const runtime = "nodejs";

function toPositiveInteger(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    return undefined;
  }

  return numberValue;
}

async function readJsonBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function cartResponse(cart: unknown, status = 200) {
  return NextResponse.json(cart, { status });
}

export async function POST(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(body.productId);

  if (!customer) {
    return cartResponse({ message: "Unauthorized" }, 401);
  }

  if (!productId) {
    return cartResponse({ message: "Invalid product id" }, 400);
  }

  const cart = await addProductToUserCart(customer.id, productId);

  if (!cart) {
    return cartResponse({ message: "Product not found" }, 404);
  }

  return cartResponse(cart);
}

export async function PATCH(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(body.productId);
  const quantity = toPositiveInteger(body.quantity);

  if (!customer) {
    return cartResponse({ message: "Unauthorized" }, 401);
  }

  if (!productId || !quantity) {
    return cartResponse({ message: "Invalid cart item" }, 400);
  }

  return cartResponse(
    await updateUserCartItemQuantity(customer.id, productId, quantity),
  );
}

export async function DELETE(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(
    body.productId ?? request.nextUrl.searchParams.get("productId"),
  );

  if (!customer) {
    return cartResponse({ message: "Unauthorized" }, 401);
  }

  if (!productId) {
    return cartResponse({ message: "Invalid product id" }, 400);
  }

  return cartResponse(await removeUserCartItem(customer.id, productId));
}
