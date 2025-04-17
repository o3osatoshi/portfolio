import { cache } from "react";
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
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default async function Page() {
  const posts = await getPosts();

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
