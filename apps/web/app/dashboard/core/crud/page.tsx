import PostCard from "@/app/dashboard/core/_components/post-card";
import CreateForm from "@/app/dashboard/core/crud/_components/create-form";
import type { Post, User } from "@/app/generated/prisma";
import { prisma } from "@repo/db";
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
      <div className="flex flex-col gap-2">
        {posts.length === 0
          ? "no posts yet"
          : posts.map((post) => {
              return <PostCard key={post.id} post={post} />;
            })}
      </div>
    </div>
  );
}
