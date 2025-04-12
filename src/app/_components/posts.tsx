import { cache } from "react";
import prisma from "@/lib/prisma";

const getPosts = cache(async () => {
  return prisma.post.findMany();
});

export default async function Posts() {
  const posts = await getPosts();

  console.log("posts", posts);

  return (
    <div className="flex gap-2">
      {posts.map((post) => {
        return <span key={post.id}>{post.title}</span>;
      })}
    </div>
  );
}
