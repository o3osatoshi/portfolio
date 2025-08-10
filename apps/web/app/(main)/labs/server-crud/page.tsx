import PostCard from "@/app/(main)/labs/_components/post-card";
import { getPosts } from "@/app/(main)/labs/_services/getPosts";
import CreateForm from "@/app/(main)/labs/server-crud/_components/create-form";

// const getPosts: () => Promise<(Post & { author: Pick<User, "name"> })[]> =
//   cache(async () => {
//     return prisma.post.findMany({
//       include: {
//         author: {
//           select: {
//             name: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   });

export default async function Page() {
  const result = await getPosts();
  if (result.isErr()) {
    return null;
  }
  const posts = result.value;

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
