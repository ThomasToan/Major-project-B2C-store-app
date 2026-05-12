import { AppLayout } from "../components/Layout/AppLayout";
// imports a layout component
import { Main } from "../components/Main";
// imports the component that shows blog posts list, part of blog title, description, image, likes/views
import { getActivePosts } from "../functions/posts";
// imports a function that filters posts

export const dynamic = "force-dynamic";
// forces the page to always renders fresh data, not cached.
export default async function Home() { // defines the Home page component, renders at /
  return (
    <AppLayout> {/*warp everything inside layout the page become [sidebar|Top menu| Content]*/}
      <Main posts={await getActivePosts()} /> {/*gets all posts, filters only active ones, passes data into Main component as props*/}
    </AppLayout>
  );
}
