import { getAllPurchasesForAdmin } from "@repo/db/store";
import { NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    return NextResponse.json(
      { message: user ? "Admin access required." : "Unauthorized" },
      { status: user ? 403 : 401 },
    );
  }

  const purchases = await getAllPurchasesForAdmin();

  return NextResponse.json({
    purchases: purchases.map((purchase) => ({
      createdAt: purchase.createdAt,
      customerEmail: purchase.customerEmail,
      customerName: purchase.customerName,
      id: purchase.id,
      items: purchase.items.map((item) => ({
        id: item.id,
        product: {
          category: item.product.category,
          id: item.product.id,
          imageUrl: item.product.imageUrl,
          name: item.product.name,
          price: item.product.price,
        },
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
        unitPrice: item.unitPrice,
      })),
      totalAmount: purchase.totalAmount,
      user: purchase.user
        ? {
            email: purchase.user.email,
            id: purchase.user.id,
            name: purchase.user.name,
            role: purchase.user.role,
          }
        : null,
      userId: purchase.userId,
    })),
  });
}
