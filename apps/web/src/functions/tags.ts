// import { posts, type Post } from "../components/data";

export function tags(posts: { tags: string; active: boolean }[]) {
  // function name:tags, input: list of posts, each post must have: tags = string, active = boolean
  return posts
    .filter((post) => post.active) // keeps only posts where ...
    .flatMap((post) => // Flattened into one array
      post.tags
        .split(",")
        .map((tag) => tag.trim()) // removes spaces
        .filter(Boolean), //removes empty values
    )
    .reduce(
      (acc, tag) => {
        const current = acc.find((item) => item.name === tag); // Check if this tag already exists in result

        if (current) {
          current.count += 1; // if exists, increase count
        } else {
          acc.push({ name: tag, count: 1 }); // if not add new
        }

        return acc;
      },
      [] as { name: string; count: number }[], // Start with empty array
    )
    .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
}
