import { readPostsFromDatabase, togglePostActive } from "@repo/db/store"; // imports the database read function adn the database toggle function
import { revalidatePath } from "next/cache";
import { isLoggedIn, logout } from "../utils/auth"; // This imports the helper function that checks whether the user is authenticated, reuses igLoggedIn() from auth.ts
import styles from "./page.module.css"; // This imports CSS module styles for this page
import { AdminPostList } from "../components/AdminPostList"; // This imports the AdminPostList component
import { LoginScreen } from "../components/LoginScreen";

export default async function Home() { // Main page component for /, use async because it calls isLoggedIn()
  const loggedIn = await isLoggedIn(); // Check whether the user is authenticated

  if (!loggedIn) { // if not logged in, return the login screen 
    return <LoginScreen />;
  }

  async function toggleActive(formData: FormData) { // Create server action (Runs when an Active/Inactive form is submitted)
    "use server";

    const urlId = formData.get("urlId"); // Gets the hidden input value from the form (server action that receives the post urlID)

    if (typeof urlId !== "string" || !urlId) { 
      return; // If urlId is missing or not a string, stop
    }

    await togglePostActive(urlId); // Call the database update function (This is the actual Active/Inactive save happens)
    revalidatePath("/"); // page revalidation so the refreshed UI shows the updated value
  }

  const posts = await readPostsFromDatabase(); // admin list page reading posts from prisma (loads current posts from Prisma)

  return ( // if logged in
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Admin of Full Stack Blog</h1>
        <form action={logout} className={styles.logoutForm}> {/* logout form*/}
          <button className={styles.button} type="submit">Logout</button> {/* logout button*/}
        </form>
      </header>
      <AdminPostList // Passing date to AdminPostList
        posts={posts.map((post) => ({
          ...post, // passes database posts into the client component
          date: post.date.toISOString(), // convert Date object to string 
        }))}
        toggleActiveAction={toggleActive} // passes the server action into the component
      />
    </main>
  );
}
