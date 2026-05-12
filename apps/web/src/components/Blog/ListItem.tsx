import type { Post } from "@repo/db/data";
import { HeartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { toUrlPath } from "@repo/utils/url";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}); // Creates a reusable date formatter

function normalizeTitle(title: string) {
  return title.replace(/!$/g, ""); // removes exclamation marks from the end of the title
}

function splitTags(tags: string) {
  return tags // converts a comma-separated string of tags into an array
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function BlogListItem({ post }: { post: Post }) { // This defines the component
  const visibleTitle = normalizeTitle(post.title); // This creates a version of the titile shown on screen

  return (
    <article
      className="grid gap-6 border-b border-[color:var(--border-color)] pb-9 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-8"
      data-test-id={`blog-post-${post.id}`}
    >
      <div className="overflow-hidden rounded-[1.5rem] bg-[color:var(--surface-muted)]">
        <img
          alt={post.title} 
          className="h-full min-h-72 w-full object-cover md:h-[18.625rem] md:min-h-0"
          src={post.imageUrl}
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-secondary">
          <time dateTime={post.date.toISOString()}> {/*give machine-readable date*/}
            {dateFormatter.format(post.date)} {/*give human-readable date*/}
          </time>
          <Link
            className="transition hover:text-primary"
            href={`/category/${toUrlPath(post.category)}`} // this renders the category as a clickable link
          >
            {post.category}
          </Link>
        </div>
        <Link
          className="mt-4 text-xl font-bold tracking-[-0.03em] text-primary transition hover:text-primary"
          href={`/post/${post.urlId}`}
        >
          {visibleTitle} {/* This is the title shown on screen */}
        </Link>
        <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-6 text-secondary">
          {post.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary">
          {splitTags(post.tags).map((tag) => (
            <Link
              key={tag}
              className="transition hover:text-primary"
              href={`/tags/${toUrlPath(tag)}`}
            >
              #{tag}
            </Link>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-color)] pt-5 text-sm font-medium text-secondary">
          <span>{post.views} views</span> {/* This shows the number of views */}
          <span className="inline-flex items-center gap-2">
            <HeartIcon className="h-4 w-4 text-red-500" />
            <span>{post.likes} likes</span> {/* This shows the number of likes */}
          </span>
        </div>
      </div>
    </article>
  );
}
