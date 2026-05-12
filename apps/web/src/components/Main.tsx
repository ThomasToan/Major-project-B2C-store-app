import type { Post } from "@repo/db/data";
import BlogList from "./Blog/List";

export function Main({
  posts,
  className,
  title = "From the blog",
  description = "Learn how to grow your business with our expert advice.",
}: {
  posts: Post[];
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className={`px-4 py-12 md:px-14 md:py-16 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-[53rem]">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-primary">
            {title}
          </h1>
          <p className="max-w-3xl text-lg leading-7 text-secondary">
            {description}
          </p>
        </div>
        <BlogList posts={posts} />
      </div>
    </main>
  );
}
