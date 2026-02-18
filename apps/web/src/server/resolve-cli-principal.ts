import "server-only";

import { createHash } from "node:crypto";

import {
  createCliPrincipalResolver,
  type ResolveCliPrincipalInput,
} from "@repo/auth";
import { createUpstashRateLimitStore } from "@repo/integrations";
import { createPrismaClient, PrismaUserIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";
import { getWebNodeLogger } from "@/lib/logger/node";
import { createRateLimitGuard, newRichError } from "@o3osatoshi/toolkit";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const userIdentityStore = new PrismaUserIdentityStore(client);
const logger = getWebNodeLogger();
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

const resolver = createCliPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  checkIdentityProvisioningRateLimit,
  findUserIdByIdentity: (input) =>
    userIdentityStore.findUserIdByIssuerSubject(input),
  issuer: env.AUTH_OIDC_ISSUER,
  resolveUserIdByIdentity: (input) => userIdentityStore.resolveUserId(input),
});

export function resolveCliPrincipal(input: ResolveCliPrincipalInput) {
  return resolver(input);
}

function hashSubject(subject: string): string {
  return createHash("sha256").update(subject).digest("hex").slice(0, 16);
}
