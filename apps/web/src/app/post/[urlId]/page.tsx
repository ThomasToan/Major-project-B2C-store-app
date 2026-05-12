import { AppLayout } from "@/components/Layout/AppLayout";
import { BlogDetail } from "@/components/Blog/Detail";
import { getDetailPost } from "@/functions/posts";
import { hasUserLikedPost } from "@repo/db/store";
import { notFound } from "next/navigation";
import { headers } from "next/headers"; // used to find userIP

export const dynamic = "force-dynamic"; // Forces dynamic rendering so fresh DB data is read

function getUserIP(forwardedFor: string | null, realIP: string | null) {
  if (forwardedFor) {
    const [firstIP] = forwardedFor.split(",");
    return firstIP?.trim() || "127.0.0.1";
  }

  return realIP?.trim() || "127.0.0.1";
}  // define getUserIP

export default async function Page({ // defines the page component
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  const post = await getDetailPost(urlId); // loads the post

  if (!post) { // checks
    notFound();
  }

  const requestHeaders = await headers(); // gets request headers
  const userIP = getUserIP( // calculate current userIP
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );
  const liked = await hasUserLikedPost(urlId, userIP); // checks if this IP already liked this post

  return <AppLayout>{await BlogDetail({ post, liked })}</AppLayout>;
}
