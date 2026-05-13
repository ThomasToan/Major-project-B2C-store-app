import {
  addProductToCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCartSession, setCartSessionCookie } from "@/functions/cartSession";

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

function cartResponse(cart: unknown, sessionId: string, status = 200) {
  const response = NextResponse.json(cart, { status });
  setCartSessionCookie(response, sessionId);
  return response;
}

export async function POST(request: NextRequest) {
  const { sessionId } = getCartSession(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(body.productId);

  if (!productId) {
    return cartResponse({ message: "Invalid product id" }, sessionId, 400);
  }

  const cart = await addProductToCart(sessionId, productId);

  if (!cart) {
    return cartResponse({ message: "Product not found" }, sessionId, 404);
  }

  return cartResponse(cart, sessionId);
}

export async function PATCH(request: NextRequest) {
  const { sessionId } = getCartSession(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(body.productId);
  const quantity = toPositiveInteger(body.quantity);

  if (!productId || !quantity) {
    return cartResponse({ message: "Invalid cart item" }, sessionId, 400);
  }

  return cartResponse(
    await updateCartItemQuantity(sessionId, productId, quantity),
    sessionId,
  );
}

export async function DELETE(request: NextRequest) {
  const { sessionId } = getCartSession(request);
  const body = await readJsonBody(request);
  const productId = toPositiveInteger(
    body.productId ?? request.nextUrl.searchParams.get("productId"),
  );

  if (!productId) {
    return cartResponse({ message: "Invalid product id" }, sessionId, 400);
  }

  return cartResponse(await removeCartItem(sessionId, productId), sessionId);
}
