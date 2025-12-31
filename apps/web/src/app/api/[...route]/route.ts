import { createAuthConfig } from "@repo/auth";
import { createUpstashRedis, ExchangeRateApi } from "@repo/integrations";
import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

import { env } from "@/env/server";
import { getWebNodeLogger } from "@/lib/logger/node";

export const runtime = "nodejs";

const cacheStore = createUpstashRedis({
  token: env.UPSTASH_REDIS_REST_TOKEN,
  url: env.UPSTASH_REDIS_REST_URL,
});
const logger = getWebNodeLogger();
const provider = new ExchangeRateApi({
  apiKey: env.EXCHANGE_RATE_API_KEY,
  baseUrl: env.EXCHANGE_RATE_BASE_URL,
  cacheStore,
  logger,
});

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
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

export const { GET, POST } = buildHandler({
  exchangeRateProvider: provider,
  authConfig,
  transactionRepo: repo,
});
