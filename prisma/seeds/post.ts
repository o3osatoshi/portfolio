import { PrismaClient } from "@/prisma";

export const seedPosts = async (prisma: PrismaClient) => {
  await prisma.post.createMany({
    data: [
      {
        title: "First Post",
        content: "This is the first post.",
        published: true,
        authorId: 1,
      },
      {
        title: "Second Post",
        content: "This is the second post.",
        published: false,
        authorId: 1,
      },
      {
        title: "Third Post",
        content: "Post by Bob",
        published: true,
        authorId: 2,
      },
      {
        title: "Another Post",
        content: "Another post by Charlie",
        published: true,
        authorId: 3,
      },
    ],
  });
};
