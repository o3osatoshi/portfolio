import { cache } from "react";
import CreateForm from "@/app/core/crud/_components/create-form";
import DeleteButton from "@/app/core/crud/_components/delete-button";
import EditDialog from "@/app/core/crud/_components/edit-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Post, User } from "@/prisma";

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
    });
  });

export default async function Page() {
  const posts = await getPosts();

  console.log("posts", posts);

  return (
    <div className="flex flex-col gap-2">
      <CreateForm />
      {posts.map((post) => {
        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.author.name}</CardDescription>
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
  );
}
