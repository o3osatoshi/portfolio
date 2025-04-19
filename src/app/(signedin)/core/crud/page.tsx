import PostCard from "@/app/(signedin)/core/_components/post-card";
import { getPosts } from "@/app/(signedin)/core/_services/getPosts";
import CreateForm from "@/app/(signedin)/core/crud/_components/create-form";

export default async function Page() {
  const result = await getPosts();
  if (result.isErr()) {
    return null;
  }
  const posts = result.value;

  if (posts.length === 0) {
    return "no posts yet";
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateForm />
      <div className="flex flex-col gap-2">
        {posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
    </div>
  );
}
