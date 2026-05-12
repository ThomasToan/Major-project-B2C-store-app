import { readPosts } from "@repo/db/store"; // get all posts
import Link from "next/link";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
// 3 sidebar sections CategoryList show categories, HistoryList show year/month, TagList show tags
export function LeftMenu({
  selectedCategory,
  selectedTag,
  selectedYear,
  selectedMonth,
}: {
  selectedCategory?: string;
  selectedTag?: string;
  selectedYear?: string;
  selectedMonth?: string;
  // this component recerives props
}) {
  const posts = readPosts(); //get all posts

  return (
    <aside className="w-full border-b border-[color:var(--border-color)] bg-[color:var(--surface-muted)] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
      <div className="flex h-full flex-col px-7 py-5 md:overflow-y-auto">
        <Link className="flex items-center gap-3" href="/">
          <img
            alt="Western Sydney University"
            className="h-8 w-8 rounded-lg object-contain"
            src="/wsulogo.png"
          />
          <div>
            <p className="text-xl font-bold tracking-[-0.03em] text-primary">
              Full Stack Blog
            </p>
          </div>
        </Link>
        <nav className="mt-12 flex flex-1 flex-col gap-9">
          <CategoryList posts={posts} selectedCategory={selectedCategory} />{/* pass posts and selected category to CategoryList */}
          <HistoryList 
            posts={posts}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          /> {/* pass posts, selected month and year to HistoryList */}
          <TagList posts={posts} selectedTag={selectedTag} /> {/* pass posts and selected tag to TagList */}
        </nav>
        <div className="mt-8 border-t border-[color:var(--border-color)] pt-5">
          <Link
            className="inline-flex rounded-lg border border-[color:var(--border-color)] px-4 py-2 text-sm font-medium text-secondary transition hover:bg-[color:var(--surface-raised)] hover:text-primary"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </div>
    </aside>
  );
}
