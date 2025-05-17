import PostCard from "@/app/(main)/core/_components/post-card";
import { getPosts } from "@/app/(main)/core/_services/getPosts";
import { auth } from "@/lib/auth";
import { getPathName } from "@/utils/handle-nav";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId === undefined) {
    redirect(getPathName("signin"));
  }

  const result = await getPosts({ authorId: userId });
  if (result.isErr()) {
    return null;
  }
  const posts = result.value;

  if (posts.length === 0) {
    return "no posts yet";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
    </div>
  );
}
