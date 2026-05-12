import { createPostInDatabase } from "@repo/db/store"; // import database create function
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PostEditor } from "../../../components/PostEditor";
import { LoginScreen } from "../../../components/LoginScreen";
import { isLoggedIn } from "../../../utils/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return <LoginScreen />;
  }

  const { saved } = await searchParams;

  async function createPost(formData: FormData) { // This function only runs later when the form submits
    "use server";

    await createPostInDatabase({ // calls store.ts
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      description: String(formData.get("description") || ""),
      content: String(formData.get("content") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      tags: String(formData.get("tags") || ""),
    });

    revalidatePath("/"); // refreshed admin home data
    redirect("/posts/create?saved=1"); // reloads page with success flag
  }

  return (
    <PostEditor
      initialValues={{
        title: "",
        category: "",
        description: "",
        content: "",
        imageUrl: "",
        tags: "",
      }}
      saveAction={createPost}
      successMessage={saved === "1" ? "Post updated successfully" : undefined}
    />
  );
}
