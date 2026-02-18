import { createHash } from "node:crypto";

import { createAuthConfig, createCliPrincipalResolver } from "@repo/auth";
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
  PrismaTransactionRepository,
  PrismaUserIdentityStore,
} from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { createRateLimitGuard, newRichError } from "@o3osatoshi/toolkit";

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
    const fxQuoteProvider = new ExchangeRateApi(
      {
        apiKey: env.EXCHANGE_RATE_API_KEY,
        baseUrl: env.EXCHANGE_RATE_BASE_URL,
      },
      {
        ...(cacheStore ? { cache: { store: cacheStore } } : {}),
        logging: { logger },
        retry: true,
      },
    );
    const rateLimitStore = createUpstashRateLimitStore({
      token: env.UPSTASH_REDIS_REST_TOKEN,
      url: env.UPSTASH_REDIS_REST_URL,
    });
    const checkIdentityProvisioningRateLimit = createRateLimitGuard<{
      issuer: string;
      subject: string;
    }>({
      buildRateLimitedError: ({ decision, rule }) =>
        newRichError({
          code: "CLI_IDENTITY_RATE_LIMITED",
          details: {
            action: "CheckCliIdentityProvisioningRateLimit",
            reason: "CLI identity provisioning is temporarily rate-limited.",
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
      onBypass: ({ error, input, rule }) => {
        logger.warn("cli_identity_rate_limit_bypassed", {
          errorCode: error.code,
          issuer: input.issuer,
          ruleId: rule.id,
          subjectHash: hashSubject(input.subject),
        });
      },
      rules: [
        {
          id: "cli-identity-subject",
          limit: 1,
          resolveIdentifier: (input) => `${input.issuer}:${input.subject}`,
          windowSeconds: env.AUTH_CLI_IDENTITY_SUBJECT_COOLDOWN_SECONDS,
        },
        {
          id: "cli-identity-issuer",
          limit: env.AUTH_CLI_IDENTITY_ISSUER_LIMIT_PER_MINUTE,
          resolveIdentifier: (input) => input.issuer,
          windowSeconds: 60,
        },
      ],
      store: rateLimitStore,
    });

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

    const transactionRepo = new PrismaTransactionRepository(client);
    const userIdentityStore = new PrismaUserIdentityStore(client);
    const resolveCliPrincipal = createCliPrincipalResolver({
      audience: env.AUTH_OIDC_AUDIENCE,
      checkIdentityProvisioningRateLimit,
      findUserIdByIdentity: (input) =>
        userIdentityStore.findUserIdByIssuerSubject(input),
      issuer: env.AUTH_OIDC_ISSUER,
      resolveUserIdByIdentity: (input) =>
        userIdentityStore.resolveUserId(input),
    });

    const app = buildApp({
      fxQuoteProvider,
      authConfig,
      resolveCliPrincipal,
      transactionRepo,
    });
    handler = createExpressRequestHandler(app);
  }
  await handler(req, res);
});

export { inngest } from "./inngest";

function hashSubject(subject: string): string {
  return createHash("sha256").update(subject).digest("hex").slice(0, 16);
}
