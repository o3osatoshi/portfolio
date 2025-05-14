import PostCard from "@/app/(signed)/core/_components/post-card";
import CreateForm from "@/app/(signed)/core/crud/_components/create-form";
import { type Post, type User, prisma } from "@repo/database";
import { cache } from "react";

const getPosts: () => Promise<(Post & { author: Pick<User, "name"> })[]> =
  cache(async () => {
    return prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default async function Page() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col gap-6">
      <CreateForm />
      {posts.length === 0 ? (
        "no posts yet"
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => {
            return <PostCard key={post.id} post={post} />;
          })}
        </div>
      )}
    </div>
  );
}
