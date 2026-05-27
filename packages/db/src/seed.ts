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
  await seedProducts();
}

export async function seedProducts() {
  await client.db.cartItem.deleteMany();
  await client.db.cart.deleteMany();
  await client.db.customerSession.deleteMany();
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
