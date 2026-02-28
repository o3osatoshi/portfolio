import {
  createAccessTokenPrincipalResolver,
  createAuthConfig,
} from "@repo/auth";
import {
  createUpstashRateLimitStore,
  createUpstashRedis,
  ExchangeRateApi,
} from "@repo/integrations";
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

import { createRateLimitGuard, newRichError } from "@o3osatoshi/toolkit";

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
    const identityProvisioningRateLimitGuard = createRateLimitGuard<
      Parameters<typeof identityStore.linkExternalIdentityToUserByEmail>[0]
    >({
      buildRateLimitedError: ({ decision, rule }) =>
        newRichError({
          code: "CLI_IDENTITY_RATE_LIMITED",
          details: {
            action: "CheckIdentityProvisioningRateLimit",
            reason: `Rate limit exceeded for rule: ${rule.id}.`,
          },
          i18n: { key: "errors.application.rate_limit" },
          isOperational: true,
          kind: "RateLimit",
          layer: "Application",
          meta: {
            limit: decision.limit,
            remaining: decision.remaining,
            resetEpochSeconds: decision.resetEpochSeconds,
            ruleId: rule.id,
          },
        }),
      failureMode: "fail-open",
      rules: [
        {
          id: "identity-provisioning-issuer",
          limit: env.AUTH_CLI_IDENTITY_ISSUER_LIMIT_PER_MINUTE,
          resolveIdentifier: (claimSet) => claimSet.issuer,
          windowSeconds: 60,
        },
        {
          id: "identity-provisioning-subject",
          limit: 1,
          resolveIdentifier: (claimSet) =>
            `${claimSet.issuer}:${claimSet.subject}`,
          windowSeconds: env.AUTH_CLI_IDENTITY_SUBJECT_COOLDOWN_SECONDS,
        },
      ],
      store: createUpstashRateLimitStore({
        token: env.UPSTASH_REDIS_REST_TOKEN,
        url: env.UPSTASH_REDIS_REST_URL,
      }),
    });
    const resolveAccessTokenPrincipal = createAccessTokenPrincipalResolver({
      audience: env.AUTH_OIDC_AUDIENCE,
      externalIdentityResolver: {
        findUserIdByKey: (key) => identityStore.findUserIdByKey(key),
        linkExternalIdentityToUserByEmail: (claimSet) =>
          identityProvisioningRateLimitGuard(claimSet).andThen(() =>
            identityStore.linkExternalIdentityToUserByEmail(claimSet),
          ),
      },
      issuer: env.AUTH_OIDC_ISSUER,
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
