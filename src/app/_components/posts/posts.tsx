import { cache } from "react";
import DeleteButton from "@/app/_components/posts/delete-button";
import Edit from "@/app/_components/posts/edit";
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

export default async function Posts() {
  const posts = await getPosts();

  console.log("posts", posts);

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => {
        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.author.name}</CardDescription>
              <CardAction>
                <Edit />
                <DeleteButton id={post.id} />
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
