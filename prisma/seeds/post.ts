import { PrismaClient } from "@/generated/prisma";

export const seedPosts = async (prisma: PrismaClient) => {
  await prisma.post.createMany({
    data: [],
  });
};
