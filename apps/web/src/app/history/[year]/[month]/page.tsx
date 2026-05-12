import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { findPostsByHistory } from "@/functions/posts";
// Imports the function that filters posts by: year, month

export const dynamic = "force-dynamic";// render page dynamically

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params; // reads the values from the url

  return (
    <AppLayout selectedMonth={month} selectedYear={year}> {/* pass selectedMonth and selectedYear into AppLayout */}
      <Main
        description={`Posts published in ${month}/${year}.`}
        posts={await findPostsByHistory(year, month)} // send the year and month from URL into the logic function
        // that function does converts year/month to number, gets active posts, check each post's date, returns only posts from that month and year
        title="History archive"
      />
    </AppLayout>
  );
}
