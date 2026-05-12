import type { Post } from "@repo/db/data";
import { marked } from "marked";
import Link from "next/link";
import { toUrlPath } from "@repo/utils/url";
import { LikeButton } from "./LikeButton";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function splitTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function BlogDetail({
  post, // receives post
  liked = false, // receives likes defaulting to false
}: {
  post: Post;
  liked?: boolean;
}) {
  const content = await marked.parse(post.content); // converts markdown content to HTML

  return ( // render article image
    <article
      className="mx-auto mt-10 w-full max-w-5xl px-4 pb-12 md:px-8"
      data-test-id={`blog-post-${post.id}`}
    >
      <div className="overflow-hidden rounded-[1.75rem] bg-[color:var(--surface-muted)]">
        <img
          alt={post.title}
          className="h-80 w-full object-cover md:h-[28rem]"
          src={post.imageUrl}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-secondary">
        <time dateTime={post.date.toISOString()}>
          {dateFormatter.format(post.date)}
        </time>
        <Link
          className="transition hover:text-primary"
          href={`/category/${toUrlPath(post.category)}`}
        >
          {post.category}
        </Link>
      </div>
      <Link
        className="mt-4 inline-block text-4xl font-bold tracking-[-0.04em] text-primary transition hover:text-primary md:text-5xl"
        href={`/post/${post.urlId}`}
      >
        {post.title}
      </Link>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-secondary">
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
      <div
        className="prose prose-lg mt-8 max-w-none text-primary prose-headings:text-primary prose-p:text-secondary prose-strong:text-primary"
        dangerouslySetInnerHTML={{ __html: content }}
        data-test-id="content-markdown"
      />
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-color)] pt-5 text-sm font-medium text-secondary">
        <span>{post.views} views</span> {/* shows number of views */}
        <LikeButton
          initialLiked={liked} // tells button whether to show Like or Unlike
          initialLikes={post.likes} // shows number of likes
          urlId={post.urlId} // tells API which post to update
        />
      </div>
    </article>
  );
}
