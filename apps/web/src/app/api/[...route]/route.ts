import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

import { env } from "@/env/server";

export const runtime = "nodejs";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);

export const { GET, POST } = buildHandler({ transactionRepo: repo });
