import fs from "node:fs";
import path from "node:path";
import type {
  Prisma,
  Product as DatabaseProduct,
} from "@prisma/client";
import { client } from "./client.js";
import { type Post, posts as seedPosts } from "./data.js";

export type StoredPost = Post & {
  liked?: boolean;
};

export type StoredProduct = DatabaseProduct;

export type ProductFilters = {
  search?: string;
  category?: string;
};

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
