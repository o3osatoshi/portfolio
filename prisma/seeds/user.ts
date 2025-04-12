import { PrismaClient } from "@/prisma/client";

export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", name: "Alice" },
      { email: "bob@example.com", name: "Bob" },
      { email: "charlie@example.com", name: "Charlie" },
    ],
  });
};
