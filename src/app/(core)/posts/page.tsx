import { cache } from "react";
import CreateForm from "@/app/(core)/posts/_components/create-form";
import DeleteButton from "@/app/(core)/posts/_components/delete-button";
import Edit from "@/app/(core)/posts/_components/edit";
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
                  <Edit />
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
