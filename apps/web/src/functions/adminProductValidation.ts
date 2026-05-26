export type AdminProductRequestBody = {
  active?: unknown;
  category?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  name?: unknown;
  price?: unknown;
  stock?: unknown;
};

export type ValidAdminProductInput = {
  active: boolean;
  category: string;
  description: string;
  imageUrl: string;
  name: string;
  price: number;
  stock: number;
};

export type ProductValidationResult =
  | {
      data: ValidAdminProductInput;
    }
  | {
      message: string;
    };

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

export function validateAdminProductInput(
  body: AdminProductRequestBody,
): ProductValidationResult {
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
