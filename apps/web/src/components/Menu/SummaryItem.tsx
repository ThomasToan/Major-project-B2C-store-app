import Link from "next/link";

export function SummaryItem({
  name,
  link,
  count,
  isSelected,
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  return (
    <li>
      <Link
        className={`flex items-center gap-3 rounded-lg px-0 py-2 text-[15px] font-semibold transition ${
          isSelected
            ? "selected text-primary"
            : "text-secondary hover:text-primary"
        }`}
        href={link}
        title={title || name}
      >
        <span
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-1.5 text-xs text-secondary"
          data-test-id="post-count"
        >
          {count}
        </span>
        <span>{name}</span>
      </Link>
    </li>
  );
}
