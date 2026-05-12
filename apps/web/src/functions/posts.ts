import {
  incrementPostViewsInDatabase,
  readPostsFromDatabase,
} from "@repo/db/store";
import { toUrlPath } from "@repo/utils/url";

export async function getPosts() {
  return readPostsFromDatabase();
}

export async function getActivePosts() {
  const posts = await getPosts();
  return posts.filter((post) => post.active);
}

export async function findPostByUrlId(urlId: string) {
  const posts = await getPosts();
  return posts.find((post) => post.urlId === urlId);
}

export async function findPostsByCategory(categorySlug: string) {
  const posts = await getActivePosts();
  return posts.filter((post) => toUrlPath(post.category) === categorySlug);
}

export async function findPostsByTag(tagSlug: string) {
  const posts = await getActivePosts();

  return posts.filter((post) =>
    post.tags
      .split(",")
      .map((tag) => tag.trim())
      .some((tag) => toUrlPath(tag) === tagSlug),
  );
}

export async function findPostsByHistory(year: string, month: string) {
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const posts = await getActivePosts();

  return posts.filter((post) => {
    const postDate = post.date;

    return (
      postDate.getFullYear() === numericYear &&
      postDate.getMonth() + 1 === numericMonth
    );
  });
}

export async function findPostsBySearch(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const posts = await getActivePosts();

  if (!normalizedQuery) {
    return posts;
  }

  return posts.filter((post) => {
    const title = post.title.toLowerCase();
    const description = post.description.toLowerCase();

    return (
      title.includes(normalizedQuery) || description.includes(normalizedQuery)
    );
  });
}

export async function getDetailPost(urlId: string) {
  return incrementPostViewsInDatabase(urlId);
}
