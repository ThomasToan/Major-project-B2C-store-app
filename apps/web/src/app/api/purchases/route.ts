import { getPurchasesForUser } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/functions/customerSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);

  if (!customer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const purchases = await getPurchasesForUser(customer.id);

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
    })),
  });
}
