import { redirect } from "next/navigation";
import DeleteButton from "@/app/(signedin)/core/crud/_components/delete-button";
import EditDialog from "@/app/(signedin)/core/crud/_components/edit-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPath } from "@/utils/path";

const getPosts = async (authorId: string) => {
  return prisma.post.findMany({
    where: { authorId },
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
};

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId === undefined) {
    redirect(getPath("signin"));
  }

  const posts = await getPosts(userId);

  if (posts.length === 0) {
    return "no posts yet";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {posts.map((post) => {
          return (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  <div className="flex gap-3">
                    <span>{post.author.name}</span>
                    <div className="flex gap-1.5">
                      <span>{post.createdAt.toLocaleTimeString()}</span>
                      <span>{post.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardDescription>
                <CardAction>
                  <div className="flex gap-1">
                    <EditDialog post={post} />
                    <DeleteButton id={post.id} />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
