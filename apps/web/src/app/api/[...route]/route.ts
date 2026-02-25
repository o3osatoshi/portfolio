import {
  createAccessTokenPrincipalResolver,
  createAuthConfig,
} from "@repo/auth";
import { createUpstashRedis, ExchangeRateApi } from "@repo/integrations";
import { buildHandler } from "@repo/interface/http/node";
import {
  createPrismaClient,
  PrismaExternalIdentityStore,
  PrismaTransactionRepository,
} from "@repo/prisma";

import { env } from "@/env/server";
import { getWebNodeLogger } from "@/lib/logger/node";

const store = createUpstashRedis({
  token: env.UPSTASH_REDIS_REST_TOKEN,
  url: env.UPSTASH_REDIS_REST_URL,
});
const logger = getWebNodeLogger();
const fxQuoteProvider = new ExchangeRateApi(
  {
    apiKey: env.EXCHANGE_RATE_API_KEY,
    baseUrl: env.EXCHANGE_RATE_BASE_URL,
  },
  {
    cache: { store },
    logging: { logger },
    retry: true,
  },
);

const client = createPrismaClient({ connectionString: env.DATABASE_URL });

const authConfig = createAuthConfig({
  providers: {
    oidc: {
      clientId: env.AUTH_OIDC_CLIENT_ID,
      clientSecret: env.AUTH_OIDC_CLIENT_SECRET,
      issuer: env.AUTH_OIDC_ISSUER,
    },
  },
  prismaClient: client,
  secret: env.AUTH_SECRET,
});

const externalIdentityStore = new PrismaExternalIdentityStore(client);
const resolveAccessTokenPrincipal = createAccessTokenPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByKey: (input) => externalIdentityStore.findUserIdByKey(input),
  issuer: env.AUTH_OIDC_ISSUER,
  linkExternalIdentityToUserByEmail: (input) =>
    externalIdentityStore.linkExternalIdentityToUserByEmail(input),
});

const transactionRepo = new PrismaTransactionRepository(client);

export const { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } = buildHandler({
  fxQuoteProvider,
  authConfig,
  resolveAccessTokenPrincipal,
  transactionRepo,
});
