// import { posts, type Post } from "../components/data";

export function categories<T>(
  posts: { category: string; active: boolean }[],
): { name: string; count: number }[] {
  // input posts array, each post has category = string, active = boolean
  return posts
    .filter((p) => p.active) // Only include active posts
    .sort((a, b) => a.category.localeCompare(b.category)) // Sort by category name alphabetically
    .reduce( // acc = result array, post = current post
      (acc, post) => {
        const category = acc.find((c) => c.name === post.category);// check if category already exists
        if (category) {
          category.count++; // if exists, increase count
        } else {
          acc.push({ name: post.category, count: 1 }); // if not, add new category with count 1
        }
        return acc; // return result array
      },
      [] as { name: string; count: number }[], // Start with empty array
    );
}
