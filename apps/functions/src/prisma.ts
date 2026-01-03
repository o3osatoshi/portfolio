import { createPrismaClient, type PrismaClient } from "@repo/prisma";

import { env } from "./env";

let prismaClient: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
  }
  return prismaClient;
}
