import { PrismaPg } from "@prisma/adapter-pg";

import { type Prisma, PrismaClient } from "../generated/prisma/client";

/**
 * Create a new PrismaClient using the `@prisma/adapter-pg` adapter.
 * Callers must manage the client's lifecycle (reuse/disconnect) as appropriate
 * for their runtime (serverless vs long-lived server).
 */
export function createPrismaClient(options: {
  connectionString: string;
  log?: Prisma.LogLevel[];
}): PrismaClient {
  const adapter = new PrismaPg({ connectionString: options.connectionString });
  const clientOptions: Prisma.PrismaClientOptions = {
    adapter,
    ...(options.log ? { log: options.log } : {}),
  };
  return new PrismaClient(clientOptions);
}

/**
 * Convenience helper to run a callback inside a transaction.
 */
export function withTransaction<T>(
  client: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return client.$transaction(fn);
}

/** Re-export generated Prisma types for downstream packages. */
export * from "../generated/prisma/client";
