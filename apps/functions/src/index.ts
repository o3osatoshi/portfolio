import { createAuthConfig } from "@repo/auth";
import { createUpstashRedis, ExchangeRateApi } from "@repo/integrations";
import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { env } from "./env";
import { getFunctionsLogger } from "./logger";

let handler: ReturnType<typeof createExpressRequestHandler> | undefined;

export const api = onRequest(async (req, res) => {
  if (!handler) {
    const cacheStore =
      env.UPSTASH_REDIS_REST_TOKEN && env.UPSTASH_REDIS_REST_URL
        ? createUpstashRedis({
            token: env.UPSTASH_REDIS_REST_TOKEN,
            url: env.UPSTASH_REDIS_REST_URL,
          })
        : undefined;
    const logger = getFunctionsLogger();
    const fxQuoteProvider = new ExchangeRateApi({
      apiKey: env.EXCHANGE_RATE_API_KEY,
      baseUrl: env.EXCHANGE_RATE_BASE_URL,
      cacheStore,
      logger,
    });

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

    const transactionRepo = new PrismaTransactionRepository(client);

    const app = buildApp({
      fxQuoteProvider,
      authConfig,
      transactionRepo,
    });
    handler = createExpressRequestHandler(app);
  }
  await handler(req, res);
});
