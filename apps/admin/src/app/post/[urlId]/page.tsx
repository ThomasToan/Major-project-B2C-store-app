import { getPostByUrlIdFromDatabase, updatePostByUrlId } from "@repo/db/store"; // This imports a function from your shared store file
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation"; // This imports Next.js built-in 404 helper
import { PostEditor } from "../../../components/PostEditor"; // Imports the shared form used for update and create page
import { LoginScreen } from "../../../components/LoginScreen"; // Imports shared login screen component
import { isLoggedIn } from "../../../utils/auth"; // Imports auth helper

export default async function Page({ 
  params,
  searchParams,
}: {
  params: Promise<{ urlId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const loggedIn = await isLoggedIn(); // calls auth helper check cookies and return true false

  if (!loggedIn) {
    return <LoginScreen />;
  }

  const { urlId } = await params; // extracts urlId from route parameters
  const { saved } = await searchParams;
  const post = await getPostByUrlIdFromDatabase(urlId); // looks up the post using urlId

  if (!post) { // if no matching post, show 404
    notFound();
  }

  async function savePost(formData: FormData) { // define savePost
    "use server";

    await updatePostByUrlId(urlId, { // calls store.ts
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      description: String(formData.get("description") || ""),
      content: String(formData.get("content") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      tags: String(formData.get("tags") || ""),
    });

    revalidatePath("/"); // refreshed admin home data
    redirect(`/post/${urlId}?saved=1`); // reloads page with success flag
  }

  return (
    <PostEditor // render editor component
      initialValues={{ // pass current post values into PostEditor
        title: post.title,
        category: post.category,
        description: post.description,
        content: post.content,
        imageUrl: post.imageUrl,
        tags: post.tags,
      }}
      saveAction={savePost}
      successMessage={saved === "1" ? "Post updated successfully" : undefined}
    />
  );
}
