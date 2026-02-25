import {
  createAccessTokenPrincipalResolver,
  createAuthConfig,
} from "@repo/auth";
import { createUpstashRedis, ExchangeRateApi } from "@repo/integrations";
import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import {
  createPrismaClient,
  PrismaExternalIdentityStore,
  PrismaTransactionRepository,
} from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { env } from "./env";
import { getFunctionsLogger } from "./logger";

let handler: ReturnType<typeof createExpressRequestHandler> | undefined;

export const api = onRequest(async (req, res) => {
  if (!handler) {
    const store =
      env.UPSTASH_REDIS_REST_TOKEN && env.UPSTASH_REDIS_REST_URL
        ? createUpstashRedis({
            token: env.UPSTASH_REDIS_REST_TOKEN,
            url: env.UPSTASH_REDIS_REST_URL,
          })
        : undefined;

    const logger = getFunctionsLogger();
    const fxQuoteProvider = new ExchangeRateApi(
      {
        apiKey: env.EXCHANGE_RATE_API_KEY,
        baseUrl: env.EXCHANGE_RATE_BASE_URL,
      },
      {
        ...(store ? { cache: { store } } : {}),
        logging: { logger },
        retry: true,
      },
    );

    const client = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
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

    const identityStore = new PrismaExternalIdentityStore(client);
    const resolveAccessTokenPrincipal = createAccessTokenPrincipalResolver({
      audience: env.AUTH_OIDC_AUDIENCE,
      findUserIdByKey: (key) => identityStore.findUserIdByKey(key),
      issuer: env.AUTH_OIDC_ISSUER,
      linkExternalIdentityToUserByEmail: (claim) =>
        identityStore.linkExternalIdentityToUserByEmail(claim),
    });

    const transactionRepo = new PrismaTransactionRepository(client);

    const app = buildApp({
      fxQuoteProvider,
      authConfig,
      resolveAccessTokenPrincipal,
      transactionRepo,
    });
    handler = createExpressRequestHandler(app);
  }

  await handler(req, res);
});

export { inngest } from "./inngest";
