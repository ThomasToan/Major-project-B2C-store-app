import { createProductForAdmin } from "@repo/db/store";
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

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    return NextResponse.json(
      { message: user ? "Admin access required." : "Unauthorized" },
      { status: user ? 403 : 401 },
    );
  }

  const validation = validateAdminProductInput(await readJsonBody(request));

  if ("message" in validation) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const product = await createProductForAdmin(validation.data);

  return NextResponse.json({ product }, { status: 201 });
}
