import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";
import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

let handler: ReturnType<typeof createExpressRequestHandler> | undefined;

export const api = onRequest(async (req, res) => {
  if (!handler) {
    const env = createEnv(
      {
        DATABASE_URL: z.string().min(1),
      },
      { name: "functions" },
    );
    const client = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
    const repo = new PrismaTransactionRepository(client);
    const app = buildApp({ transactionRepo: repo });
    handler = createExpressRequestHandler(app);
  }
  await handler(req, res);
});
