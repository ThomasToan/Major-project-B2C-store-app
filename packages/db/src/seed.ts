import { client } from "./client.js";
import { posts, products } from "./data.js";
import { resetPosts } from "./store.js";

export async function seed() {
  resetPosts();
  // This clears old test data
  await client.db.like.deleteMany();
  await client.db.post.deleteMany();

  for (const post of posts) {
    await client.db.post.create({
      // This inserts each seeded post into the databse and keeps its original active value
      data: {
        id: post.id,
        urlId: post.urlId,
        title: post.title,
        content: post.content,
        description: post.description,
        imageUrl: post.imageUrl,
        date: post.date,
        category: post.category,
        views: post.views,
        likes: post.likes,
        tags: post.tags
          .split(",")
          .map((tag) => tag.trim())
          .join(","),
        active: post.active, // seeded posts with know active values/
      },
    });

    for (let i = 0; i < post.likes; i++) {
      await client.db.like.create({
        data: {
          postId: post.id,
          userIP: `192.168.100.${i}`,
        },
      });
    }
  }

  await seedProducts();
}

export async function seedProducts() {
  await client.db.cartItem.deleteMany();
  await client.db.cart.deleteMany();
  await client.db.purchaseItem.deleteMany();
  await client.db.purchase.deleteMany();
  await client.db.product.deleteMany();

  for (const product of products) {
    await client.db.product.create({
      data: product,
    });
  }
}
