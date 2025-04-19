import { redirect } from "next/navigation";
import PostCard from "@/app/(signedin)/core/_components/post-card";
import { getPosts } from "@/app/(signedin)/core/_services/getPosts";
import { auth } from "@/lib/auth";
import { getPath } from "@/utils/path";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId === undefined) {
    redirect(getPath("signin"));
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
