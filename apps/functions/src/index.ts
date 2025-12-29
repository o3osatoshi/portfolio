import { createAuthConfig } from "@repo/auth";
import { ExchangeRateHostProvider } from "@repo/integrations";
import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { env } from "./env";

let handler: ReturnType<typeof createExpressRequestHandler> | undefined;

export const api = onRequest(async (req, res) => {
  if (!handler) {
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
    const exchangeRateProvider = new ExchangeRateHostProvider({
      apiKey: env.EXCHANGE_RATE_HOST_API_KEY,
      baseUrl: env.EXCHANGE_RATE_HOST_BASE_URL,
    });
    const app = buildApp({
      authConfig,
      exchangeRateProvider,
      transactionRepo: repo,
    });
    handler = createExpressRequestHandler(app);
  }
  await handler(req, res);
});
