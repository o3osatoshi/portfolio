import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Singleton Prisma client using the `@prisma/adapter-pg` adapter. Reuses the
 * instance on subsequent imports during development to avoid exhausting
 * database connections.
 */
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;

/** Re-export generated Prisma types for downstream packages. */
export * from "../generated/prisma/client";
