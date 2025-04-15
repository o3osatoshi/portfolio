import { PrismaClient } from "@/prisma";

export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.user.createMany({
    data: [],
  });
};
