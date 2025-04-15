import { PrismaClient } from "@/prisma";

export const seedPosts = async (prisma: PrismaClient) => {
  await prisma.post.createMany({
    data: [],
  });
};
