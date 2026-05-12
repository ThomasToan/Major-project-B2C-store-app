import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { findPostsByTag } from "@/functions/posts";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  return (
    <AppLayout selectedTag={tag}>
      <Main
        description={`Posts tagged with ${tag}.`}
        posts={await findPostsByTag(tag)}
        title="Tag archive"
      />
    </AppLayout>
  );
}
