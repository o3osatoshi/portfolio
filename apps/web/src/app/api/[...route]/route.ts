import { createAuthConfig } from "@repo/auth";
import { ExchangeRateHostProvider } from "@repo/integrations";
import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

import { env } from "@/env/server";
import { initWebNodeLogger } from "@/lib/logger/node";

export const runtime = "nodejs";

initWebNodeLogger();

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const exchangeRateProvider = new ExchangeRateHostProvider({
  apiKey: env.EXCHANGE_RATE_API_KEY,
  baseUrl: env.EXCHANGE_RATE_BASE_URL,
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

export const { GET, POST } = buildHandler({
  exchangeRateProvider,
  authConfig,
  transactionRepo: repo,
});
