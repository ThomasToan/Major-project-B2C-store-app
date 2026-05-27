import { getProductForAdmin, updateProductForAdmin } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import {
  type AdminProductRequestBody,
  validateAdminProductInput,
} from "@/functions/adminProductValidation";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const runtime = "nodejs";

async function readJsonBody(
  request: NextRequest,
): Promise<AdminProductRequestBody> {
  try {
    return (await request.json()) as AdminProductRequestBody;
  } catch {
    return {};
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    return NextResponse.json(
      { message: user ? "Admin access required." : "Unauthorized" },
      { status: user ? 403 : 401 },
    );
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return NextResponse.json(
      { message: "Invalid product id." },
      { status: 400 },
    );
  }

  const existingProduct = await getProductForAdmin(productId);

  if (!existingProduct) {
    return NextResponse.json(
      { message: "Product not found." },
      { status: 404 },
    );
  }

  const validation = validateAdminProductInput(await readJsonBody(request));

  if ("message" in validation) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const product = await updateProductForAdmin(productId, validation.data);

  return NextResponse.json({ product });
}
