import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

const databaseUrl = defineSecret("DATABASE_URL");

const client = createPrismaClient({ connectionString: databaseUrl.value() });
const repo = new PrismaTransactionRepository(client);

const app = buildApp({ transactionRepo: repo });

export const api = onRequest(
  { secrets: [databaseUrl] },
  createExpressRequestHandler(app),
);
