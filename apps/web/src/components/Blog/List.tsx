import type { Post } from "@repo/db/data";
// import the post type so posts must be an array of valid blog posts
import { BlogListItem } from "./ListItem";

export function BlogList({ posts }: { posts: Post[] }) {
  // receives posts as a prop, expects an array on posts
  if (posts.length === 0) {
    return (
      <div className="mt-12 rounded-[1.75rem] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-6 py-16 text-center">
        <p className="text-3xl font-bold text-primary">0 Posts</p> 
        <p className="mt-2 text-secondary">No matching articles were found.</p>{/* shows a helpful message to the user */}
      </div>
    );
  }

  return (
    <div className="mt-14 space-y-10">
      {posts.map((post) => (
        <BlogListItem key={post.id} post={post} />
      ))}
    </div>
  );
}

export default BlogList;
