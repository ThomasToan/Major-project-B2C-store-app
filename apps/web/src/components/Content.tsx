import type { PropsWithChildren } from "react";

export function Content({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[color:var(--surface-raised)]">
      {children}
    </div>
  );
}
