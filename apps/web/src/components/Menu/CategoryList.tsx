import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import {
  BookmarkSquareIcon,
  CircleStackIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { toUrlPath } from "@repo/utils/url";

const categoryItems = [
  { icon: BookmarkSquareIcon, name: "React" },
  { icon: ServerStackIcon, name: "Node" },
  { icon: CircleStackIcon, name: "Mongo" },
  { icon: WrenchScrewdriverIcon, name: "DevOps" },
];

export function CategoryList({
  posts,
  selectedCategory,
}: {
  posts: Post[];
  selectedCategory?: string;
}) {
  categories(posts);

  return (
    <section className="space-y-3">
      <ul className="space-y-3">
        {categoryItems.map((item) => {
          const href = `/category/${toUrlPath(item.name)}`;
          const Icon = item.icon;
          const isSelected = selectedCategory === toUrlPath(item.name);

          return (
            <li key={item.name}>
              <Link
                className={`flex items-center gap-3 rounded-lg px-0 py-1.5 text-[15px] font-semibold transition ${
                  isSelected
                    ? "text-primary"
                    : "text-secondary hover:text-primary"
                }`}
                href={href}
                title={`Category / ${item.name}`}
              >
                <Icon className="h-5 w-5 shrink-0 text-secondary" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
