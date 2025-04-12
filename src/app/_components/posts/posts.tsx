import { cache } from "react";
import Delete from "@/app/_components/posts/delete";
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

const getPosts = cache(async () => {
  return prisma.post.findMany();
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
              <CardDescription>{post.authorId}</CardDescription>
              <CardAction>
                <Edit />
                <Delete />
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
