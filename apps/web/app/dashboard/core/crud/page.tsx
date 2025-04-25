import CreateForm from "@/app/dashboard/core/crud/_components/create-form";

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
  // const posts = await getPosts();

  return (
    <div className="flex flex-col gap-6">
      <CreateForm />
      crud
      {/*<div className="flex flex-col gap-2">*/}
      {/*  {posts.length === 0*/}
      {/*    ? "no posts yet"*/}
      {/*    : posts.map((post) => {*/}
      {/*        return <PostCard key={post.id} post={post} />;*/}
      {/*      })}*/}
      {/*</div>*/}
    </div>
  );
}
