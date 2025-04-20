import { PrismaClient } from "@/generated/prisma";
import { seedPosts } from "./seeds/post";
import { seedUsers } from "./seeds/user";

const prisma = new PrismaClient();

async function main() {
  await seedUsers(prisma);
  await seedPosts(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
