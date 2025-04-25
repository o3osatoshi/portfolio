import { PrismaClient } from "@repo/db";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
