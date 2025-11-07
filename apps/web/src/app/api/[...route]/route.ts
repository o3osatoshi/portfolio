import { buildHandler } from "@repo/interface/http/node";
import { PrismaTransactionRepository } from "@repo/prisma";

export const runtime = "nodejs";

const repo = new PrismaTransactionRepository();

export const { GET, POST } = buildHandler({ transactionRepo: repo });
