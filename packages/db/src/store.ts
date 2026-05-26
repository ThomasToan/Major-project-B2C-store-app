import fs from "node:fs";
import path from "node:path";
import type {
  Prisma,
  Product as DatabaseProduct,
  User as DatabaseUser,
} from "@prisma/client";
import { client } from "./client.js";
import { type Post, posts as seedPosts } from "./data.js";

export type StoredPost = Post & {
  liked?: boolean;
};

export type StoredProduct = DatabaseProduct;

export type SafeCustomer = Pick<
  DatabaseUser,
  "id" | "name" | "email" | "role" | "createdAt"
>;

export type ProductFilters = {
  search?: string;
  category?: string;
};

export type AdminProductInput = {
  active: boolean;
  category: string;
  description: string;
  imageUrl: string;
  name: string;
  price: number;
  stock: number;
};

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type PurchaseWithItems = Prisma.PurchaseGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type CartSummaryItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: StoredProduct;
};

export type CartSummary = {
  sessionId: string | null;
  userId: number | null;
  items: CartSummaryItem[];
  itemCount: number;
  total: number;
};

export type PurchaseSummaryItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: StoredProduct;
};

export type PurchaseSummary = {
  id: number;
  userId: number | null;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  createdAt: Date;
  items: PurchaseSummaryItem[];
};

export type CheckoutErrorCode =
  | "EMPTY_CART"
  | "INSUFFICIENT_STOCK"
  | "PRODUCT_INACTIVE"
  | "USER_NOT_FOUND";

export class CheckoutError extends Error {
  code: CheckoutErrorCode;

  constructor(code: CheckoutErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "CheckoutError";
  }
}

type SerializablePost = Omit<StoredPost, "date"> & {
  date: string;
};

function findWorkspaceRoot(startDir: string) {
  let currentDir = startDir;

  while (true) {
    if (
      fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml")) ||
      fs.existsSync(path.join(currentDir, ".git"))
    ) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      return undefined;
    }

    currentDir = parentDir;
  }
}

function resolveRuntimeDir() {
  const workspaceRoot = findWorkspaceRoot(process.cwd());

  if (workspaceRoot) {
    return path.join(workspaceRoot, "packages", "db", ".runtime");
  }

  return path.resolve(process.cwd(), "packages", "db", ".runtime");
}

const runtimeDir = resolveRuntimeDir();
const storePath = path.join(runtimeDir, "posts.json");

function ensureRuntimeDir() {
  fs.mkdirSync(runtimeDir, { recursive: true });
}

function serializePost(post: StoredPost): SerializablePost {
  return {
    ...post,
    date: post.date.toISOString(),
  };
}

function deserializePost(post: SerializablePost): StoredPost {
  return {
    ...post,
    date: new Date(post.date),
  };
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(",");
}

function defaultPosts(): StoredPost[] {
  return seedPosts.map((post: Post) => ({
    ...post,
    tags: normalizeTags(post.tags),
    liked: false,
  }));
}

function ensureStore() {
  ensureRuntimeDir();

  if (!fs.existsSync(storePath)) {
    writePosts(defaultPosts());
  }
}

export function readPosts(): StoredPost[] {
  ensureStore();

  const raw = fs.readFileSync(storePath, "utf8");
  const parsed = JSON.parse(raw) as SerializablePost[];
  return parsed.map(deserializePost);
}

export function writePosts(posts: StoredPost[]) {
  ensureRuntimeDir();
  fs.writeFileSync(
    storePath,
    JSON.stringify(posts.map(serializePost), null, 2),
    "utf8",
  );
}

export function resetPosts() {
  writePosts(defaultPosts());
  return readPosts();
}

export function getPostByUrlId(urlId: string) {
  return readPosts().find((post) => post.urlId === urlId);
}

export function incrementPostViews(urlId: string) {
  const posts = readPosts();
  const index = posts.findIndex((post) => post.urlId === urlId);

  if (index === -1) {
    return undefined;
  }

  const updatedPost = {
    ...posts[index]!,
    views: posts[index]!.views + 1,
  };

  posts[index] = updatedPost;
  writePosts(posts);
  return updatedPost;
}

function fromDatabasePost(post: Post): StoredPost {
  return {
    ...post,
    date: new Date(post.date),
    tags: normalizeTags(post.tags),
    liked: false,
  };
}

export async function readPostsFromDatabase(): Promise<StoredPost[]> {
  const posts = await client.db.post.findMany({
    //Get many posts from the Prisma database
    orderBy: {
      date: "desc", // newest posts first
    },
  });

  return posts.map((post) => fromDatabasePost(post as Post)); //converts databse posts into the same shape your React components expect
}

function buildProductWhere(filters: ProductFilters = {}) {
  const search = filters.search?.trim();
  const category = filters.category?.trim();
  const where: Prisma.ProductWhereInput = {
    active: true,
  };

  if (search) {
    where.name = {
      contains: search,
    };
  }

  if (category) {
    where.category = category;
  }

  return where;
}

export async function readActiveProductsFromDatabase(
  filters: ProductFilters = {},
): Promise<StoredProduct[]> {
  return client.db.product.findMany({
    where: buildProductWhere(filters),
    orderBy: [
      {
        category: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getAllProductsForAdmin(): Promise<StoredProduct[]> {
  return client.db.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export async function createProductForAdmin(
  input: AdminProductInput,
): Promise<StoredProduct> {
  return client.db.product.create({
    data: {
      active: input.active,
      category: input.category,
      description: input.description,
      imageUrl: input.imageUrl,
      name: input.name,
      price: input.price,
      stock: input.stock,
    },
  });
}

export async function readActiveProductByIdFromDatabase(
  id: number,
): Promise<StoredProduct | null> {
  return client.db.product.findFirst({
    where: {
      active: true,
      id,
    },
  });
}

export async function readActiveProductCategoriesFromDatabase(): Promise<
  string[]
> {
  const categories = await client.db.product.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
    where: {
      active: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  return categories.map((product) => product.category);
}

function emptyCartSummary(
  sessionId: string | null,
  userId: number | null = null,
): CartSummary {
  return {
    itemCount: 0,
    items: [],
    sessionId,
    userId,
    total: 0,
  };
}

function toCartSummary(cart: CartWithItems): CartSummary {
  const items = cart.items.map((item) => {
    const unitPrice = item.product.price;
    const subtotal = unitPrice * item.quantity;

    return {
      id: item.id,
      product: item.product,
      productId: item.productId,
      quantity: item.quantity,
      subtotal,
      unitPrice,
    };
  });

  return {
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    items,
    sessionId: cart.sessionId,
    userId: cart.userId,
    total: items.reduce((total, item) => total + item.subtotal, 0),
  };
}

function toPurchaseSummary(purchase: PurchaseWithItems): PurchaseSummary {
  return {
    createdAt: purchase.createdAt,
    customerEmail: purchase.customerEmail,
    customerName: purchase.customerName,
    id: purchase.id,
    items: purchase.items.map((item) => ({
      id: item.id,
      product: item.product,
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
      unitPrice: item.unitPrice,
    })),
    totalAmount: purchase.totalAmount,
    userId: purchase.userId,
  };
}

function normalizeSessionId(sessionId: string) {
  return sessionId.trim();
}

function normalizeQuantity(quantity: number) {
  return Math.max(1, Math.floor(quantity));
}

function toSafeCustomer(user: DatabaseUser): SafeCustomer {
  return {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

export async function createCustomerUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const user = await client.db.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: "CUSTOMER",
    },
  });

  return toSafeCustomer(user);
}

export async function findCustomerUserByEmail(email: string) {
  return client.db.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createCustomerSession(input: {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}) {
  return client.db.customerSession.create({
    data: input,
  });
}

export async function getCustomerBySessionId(sessionId: string) {
  const session = await client.db.customerSession.findUnique({
    include: {
      user: true,
    },
    where: {
      sessionId,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await client.db.customerSession.delete({
        where: {
          sessionId,
        },
      });
    }

    return undefined;
  }

  return toSafeCustomer(session.user);
}

export async function deleteCustomerSession(sessionId: string) {
  await client.db.customerSession.deleteMany({
    where: {
      sessionId,
    },
  });
}

export async function getOrCreateCartBySessionId(sessionId: string) {
  const normalizedSessionId = normalizeSessionId(sessionId);
  const existingCart = await client.db.cart.findUnique({
    where: {
      sessionId: normalizedSessionId,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return client.db.cart.create({
    data: {
      sessionId: normalizedSessionId,
    },
  });
}

export async function getOrCreateCartByUserId(userId: number) {
  const existingCart = await client.db.cart.findUnique({
    where: {
      userId,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return client.db.cart.create({
    data: {
      userId,
    },
  });
}

export async function getCartBySessionId(
  sessionId: string,
): Promise<CartSummary> {
  const normalizedSessionId = normalizeSessionId(sessionId);
  const cart = await client.db.cart.findUnique({
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    where: {
      sessionId: normalizedSessionId,
    },
  });

  if (!cart) {
    return emptyCartSummary(normalizedSessionId);
  }

  return toCartSummary(cart);
}

export async function getCartByUserId(userId: number): Promise<CartSummary> {
  const cart = await client.db.cart.findUnique({
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    where: {
      userId,
    },
  });

  if (!cart) {
    return emptyCartSummary(null, userId);
  }

  return toCartSummary(cart);
}

async function addProductToCartRecord(
  cartId: number,
  productId: number,
): Promise<CartSummary | undefined> {
  const product = await client.db.product.findFirst({
    where: {
      active: true,
      id: productId,
    },
  });

  if (!product) {
    return undefined;
  }

  await client.db.cartItem.upsert({
    create: {
      cartId,
      productId,
      quantity: 1,
    },
    update: {
      quantity: {
        increment: 1,
      },
    },
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });

  const cart = await client.db.cart.findUniqueOrThrow({
    where: {
      id: cartId,
    },
  });

  return cart.userId
    ? getCartByUserId(cart.userId)
    : getCartBySessionId(cart.sessionId || "");
}

export async function addProductToCart(
  sessionId: string,
  productId: number,
): Promise<CartSummary | undefined> {
  const cart = await getOrCreateCartBySessionId(sessionId);
  return addProductToCartRecord(cart.id, productId);
}

export async function addProductToUserCart(
  userId: number,
  productId: number,
): Promise<CartSummary | undefined> {
  const cart = await getOrCreateCartByUserId(userId);
  return addProductToCartRecord(cart.id, productId);
}

export async function mergeGuestCartIntoUserCart(
  sessionId: string | undefined,
  userId: number,
): Promise<CartSummary> {
  const normalizedSessionId = sessionId?.trim();

  if (!normalizedSessionId) {
    await getOrCreateCartByUserId(userId);
    return getCartByUserId(userId);
  }

  const guestCart = await client.db.cart.findUnique({
    include: {
      items: true,
    },
    where: {
      sessionId: normalizedSessionId,
    },
  });
  const userCart = await getOrCreateCartByUserId(userId);

  if (!guestCart || guestCart.id === userCart.id) {
    return getCartByUserId(userId);
  }

  for (const item of guestCart.items) {
    await client.db.cartItem.upsert({
      create: {
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
      },
      update: {
        quantity: {
          increment: item.quantity,
        },
      },
      where: {
        cartId_productId: {
          cartId: userCart.id,
          productId: item.productId,
        },
      },
    });
  }

  await client.db.cartItem.deleteMany({
    where: {
      cartId: guestCart.id,
    },
  });
  await client.db.cart.delete({
    where: {
      id: guestCart.id,
    },
  });

  return getCartByUserId(userId);
}

async function updateCartItemQuantityForCart(
  cartId: number,
  productId: number,
  quantity: number,
): Promise<void> {
  await client.db.cartItem.updateMany({
    data: {
      quantity: normalizeQuantity(quantity),
    },
    where: {
      cartId,
      productId,
    },
  });
}

export async function updateCartItemQuantity(
  sessionId: string,
  productId: number,
  quantity: number,
): Promise<CartSummary> {
  const cart = await getOrCreateCartBySessionId(sessionId);

  await updateCartItemQuantityForCart(cart.id, productId, quantity);
  return getCartBySessionId(sessionId);
}

export async function updateUserCartItemQuantity(
  userId: number,
  productId: number,
  quantity: number,
): Promise<CartSummary> {
  const cart = await getOrCreateCartByUserId(userId);

  await updateCartItemQuantityForCart(cart.id, productId, quantity);
  return getCartByUserId(userId);
}

async function removeCartItemForCart(
  cartId: number,
  productId: number,
): Promise<void> {
  await client.db.cartItem.deleteMany({
    where: {
      cartId,
      productId,
    },
  });
}

export async function removeCartItem(
  sessionId: string,
  productId: number,
): Promise<CartSummary> {
  const cart = await getOrCreateCartBySessionId(sessionId);

  await removeCartItemForCart(cart.id, productId);
  return getCartBySessionId(sessionId);
}

export async function removeUserCartItem(
  userId: number,
  productId: number,
): Promise<CartSummary> {
  const cart = await getOrCreateCartByUserId(userId);

  await removeCartItemForCart(cart.id, productId);
  return getCartByUserId(userId);
}

export async function clearCart(sessionId: string): Promise<CartSummary> {
  const cart = await getOrCreateCartBySessionId(sessionId);

  await client.db.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return getCartBySessionId(sessionId);
}

export async function clearUserCart(userId: number): Promise<CartSummary> {
  const cart = await getOrCreateCartByUserId(userId);

  await client.db.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return getCartByUserId(userId);
}

export async function checkoutUserCart(
  userId: number,
): Promise<PurchaseSummary> {
  return client.db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new CheckoutError(
        "USER_NOT_FOUND",
        "Customer account was not found.",
      );
    }

    const cart = await tx.cart.findUnique({
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
      where: {
        userId,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new CheckoutError("EMPTY_CART", "Your cart is empty.");
    }

    for (const item of cart.items) {
      if (!item.product.active) {
        throw new CheckoutError(
          "PRODUCT_INACTIVE",
          `${item.product.name} is no longer available.`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new CheckoutError(
          "INSUFFICIENT_STOCK",
          `Insufficient stock for ${item.product.name}.`,
        );
      }
    }

    const totalAmount = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    const purchase = await tx.purchase.create({
      data: {
        customerEmail: user.email,
        customerName: user.name,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
        totalAmount,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
        where: {
          id: item.productId,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return toPurchaseSummary(purchase);
  });
}

export async function getPurchasesForUser(
  userId: number,
): Promise<PurchaseSummary[]> {
  const purchases = await client.db.purchase.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId,
    },
  });

  return purchases.map(toPurchaseSummary);
}

export async function getPostByUrlIdFromDatabase(urlId: string) {
  const post = await client.db.post.findUnique({
    where: {
      urlId, // finds by urlId
    },
  });

  if (!post) {
    return undefined;
  }

  return fromDatabasePost(post as Post); // converts database post intp app format
}

export async function incrementPostViewsInDatabase(urlId: string) {
  const post = await client.db.post.update({
    where: {
      urlId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return fromDatabasePost(post as Post);
}

type EditablePostInput = {
  title: string;
  category: string;
  description: string;
  content: string;
  imageUrl: string;
  tags: string;
};

function toUrlId(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updatePostByUrlId(
  urlId: string, // tells Prisma which post to update
  input: EditablePostInput, // contains the new form values
) {
  const updatedPost = await client.db.post.update({
    // Starts a Prisma update query
    where: {
      urlId, // finds the post by unique urlId
    },
    data: {
      // these are the fields saved into database
      title: input.title,
      category: input.category,
      description: input.description,
      content: input.content,
      imageUrl: input.imageUrl,
      tags: normalizeTags(input.tags),
    },
  });

  return fromDatabasePost(updatedPost as Post); // returns the updated post
}

export async function createPostInDatabase(input: EditablePostInput) {
  const createdPost = await client.db.post.create({
    // starts Prisma create
    data: {
      urlId: toUrlId(input.title), // calls line 191
      title: input.title,
      category: input.category,
      description: input.description,
      content: input.content,
      imageUrl: input.imageUrl,
      tags: normalizeTags(input.tags),
      date: new Date(),
      views: 0,
      likes: 0,
      active: true,
    },
  });

  return fromDatabasePost(createdPost as Post); // Returns the created post
}

export async function togglePostActive(urlId: string) {
  const existingPost = await client.db.post.findUnique({
    // this finds one post from databse using urlId
    where: {
      urlId,
    },
  });

  if (!existingPost) {
    // if no post exist, stop safely
    return undefined;
  }

  const updatedPost = await client.db.post.update({
    // Database update that flips active
    where: {
      urlId,
    },
    data: {
      active: !existingPost.active, // if the current value is false, it becomes true, same as other situation
    },
  });

  return fromDatabasePost(updatedPost as Post);
}

function normalizeUserIP(userIP: string) {
  return userIP.trim() || "127.0.0.1";
}

export async function togglePostLikeInDatabase(urlId: string, userIP: string) {
  const normalizedIP = normalizeUserIP(userIP);

  return client.db.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: {
        urlId,
      },
    });

    if (!post) {
      return undefined;
    }

    const existingLike = await tx.like.findUnique({
      where: {
        postId_userIP: {
          postId: post.id,
          userIP: normalizedIP,
        },
      },
    });

    if (existingLike) {
      const updatedPost = await tx.post.update({
        where: {
          id: post.id,
        },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      await tx.like.delete({
        where: {
          postId_userIP: {
            postId: post.id,
            userIP: normalizedIP,
          },
        },
      });

      return {
        liked: false,
        post: fromDatabasePost(updatedPost as Post),
      };
    }

    await tx.like.create({
      data: {
        postId: post.id,
        userIP: normalizedIP,
      },
    });

    const updatedPost = await tx.post.update({
      where: {
        id: post.id,
      },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return {
      liked: true,
      post: fromDatabasePost(updatedPost as Post),
    };
  });
}

export async function hasUserLikedPost(urlId: string, userIP: string) {
  const normalizedIP = normalizeUserIP(userIP);
  const post = await client.db.post.findUnique({
    where: {
      urlId,
    },
  });

  if (!post) {
    return false;
  }

  const like = await client.db.like.findUnique({
    where: {
      postId_userIP: {
        postId: post.id,
        userIP: normalizedIP,
      },
    },
  });

  return Boolean(like);
}
