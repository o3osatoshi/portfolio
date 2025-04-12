import prisma from "@/lib/prisma";

export default async function Posts() {
  const posts = await prisma.post.findMany();

  console.log("posts", posts);

  return (
    <div className="flex gap-2">
      {posts.map((post) => {
        return <span key={post.id}>{post.title}</span>;
      })}
    </div>
  );
}
