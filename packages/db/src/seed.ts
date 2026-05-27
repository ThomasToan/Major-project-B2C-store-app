import { Prisma } from "@prisma/client";
import { client } from "./client.js";
import { products } from "./data.js";
import { hashPassword } from "./password.js";

const adminUser = {
  email: "admin@thomasstore.com",
  name: "Thomas Store Admin",
  password: "admin123",
  role: "ADMIN",
};

export async function seed() {
  await withSeedRetry(seedProducts);
}

export async function seedProducts() {
  await client.db.cartItem.deleteMany();
  await client.db.customerSession.deleteMany();
  await client.db.cart.deleteMany();
  await client.db.purchaseItem.deleteMany();
  await client.db.purchase.deleteMany();
  await client.db.user.deleteMany();
  await client.db.product.deleteMany();

  for (const product of products) {
    await client.db.product.create({
      data: product,
    });
  }

  await client.db.user.create({
    data: {
      email: adminUser.email,
      name: adminUser.name,
      passwordHash: await hashPassword(adminUser.password),
      role: adminUser.role,
    },
  });
}

function isRetryableSeedError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P1001", "P1002", "P1017"].includes(error.code)
  ) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("Can't reach database server") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

async function withSeedRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableSeedError(error)) {
        throw error;
      }

      await client.db.$disconnect().catch(() => undefined);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 10_000)),
      );
    }
  }

  return operation();
}
