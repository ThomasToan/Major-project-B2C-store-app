import { createProductForAdmin } from "@repo/db/store";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const runtime = "nodejs";

type CreateProductBody = {
  active?: unknown;
  category?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  name?: unknown;
  price?: unknown;
  stock?: unknown;
};

type ValidationResult =
  | {
      data: {
        active: boolean;
        category: string;
        description: string;
        imageUrl: string;
        name: string;
        price: number;
        stock: number;
      };
    }
  | {
      message: string;
    };

async function readJsonBody(request: NextRequest): Promise<CreateProductBody> {
  try {
    return (await request.json()) as CreateProductBody;
  } catch {
    return {};
  }
}

function toRequiredString(value: unknown) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue || undefined;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return Number.NaN;
}

function validateProductInput(body: CreateProductBody): ValidationResult {
  const name = toRequiredString(body.name);
  const description = toRequiredString(body.description);
  const imageUrl = toRequiredString(body.imageUrl);
  const category = toRequiredString(body.category);
  const price = toNumber(body.price);
  const stock = toNumber(body.stock);

  if (!name) {
    return { message: "Product name is required." };
  }

  if (!description) {
    return { message: "Product description is required." };
  }

  if (!imageUrl) {
    return { message: "Product image URL is required." };
  }

  if (!category) {
    return { message: "Product category is required." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { message: "Price must be greater than 0." };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return {
      message: "Stock must be a whole number greater than or equal to 0.",
    };
  }

  if (typeof body.active !== "boolean") {
    return { message: "Active must be true or false." };
  }

  return {
    data: {
      active: body.active,
      category,
      description,
      imageUrl,
      name,
      price,
      stock,
    },
  };
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

  const validation = validateProductInput(await readJsonBody(request));

  if ("message" in validation) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const product = await createProductForAdmin(validation.data);

  return NextResponse.json({ product }, { status: 201 });
}
