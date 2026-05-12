import { AppLayout } from "@/components/Layout/AppLayout";
// import the shared app layout
import { Main } from "@/components/Main";
import { findPostsBySearch } from "@/functions/posts";// for reading the search text, filtering active posts, matching title or description

export const dynamic = "force-dynamic"; // dynamic rendering

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const query = q || ""; // make sure query always has a string value

  return (
    <AppLayout query={query}> {/* pass query={query} into AppLayout*/}
      <Main
        description={
          query
            ? `Showing results for "${query}".`
            : "Start typing to filter articles by title or description."
        }
        posts={await findPostsBySearch(query)} // returns all active posts where titile contains query or description cotains query
        title="Search results"
      />
    </AppLayout>
  );
}
