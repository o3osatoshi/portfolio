import { createAuthConfig } from "@repo/auth";
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
        AUTH_GOOGLE_ID: z.string().min(1),
        AUTH_GOOGLE_SECRET: z.string().min(1),
        AUTH_SECRET: z.string().min(1),
        DATABASE_URL: z.string().min(1),
      },
      { name: "functions" },
    );
    const client = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
    const authConfig = createAuthConfig({
      providers: {
        google: {
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        },
      },
      prismaClient: client,
      secret: env.AUTH_SECRET,
    });
    const repo = new PrismaTransactionRepository(client);
    const app = buildApp({ authConfig, transactionRepo: repo });
    handler = createExpressRequestHandler(app);
  }
  await handler(req, res);
});
