import { AppLayout } from "@/components/Layout/AppLayout";
// Wraps the page with the left sidebar, the top menu, the main content section
import { Main } from "@/components/Main";
// showing page title, page description, list of blog posts
import { findPostsByCategory } from "@/functions/posts";
// import filtering function from the logic layer
export const dynamic = "force-dynamic";
// remder the page dynamically
export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>; // name is a route parameter
}) {
  const { name } = await params; // extract the name value from the route parameters

  return (
    <AppLayout selectedCategory={name}> {/* pass the current category slug into the layout*/}
      <Main
        description={`Posts filed under ${name}.`} // set the page description text
        posts={await findPostsByCategory(name)} 
        title="Category archive"
      />
    </AppLayout>
  );
}
