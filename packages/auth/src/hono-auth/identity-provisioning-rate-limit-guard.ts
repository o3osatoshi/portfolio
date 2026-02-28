import type { ExternalIdentityClaimSet } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

import type {
  RateLimitFailureMode,
  RateLimitStore,
  RichError,
} from "@o3osatoshi/toolkit";
import { createRateLimitGuard, newRichError } from "@o3osatoshi/toolkit";

/**
 * Options for creating the CLI identity provisioning rate-limit guard.
 *
 * @public
 */
export type CreateIdentityProvisioningRateLimitGuardOptions = {
  /**
   * Store-failure behavior. Defaults to `"fail-open"` to avoid blocking auth flow
   * when the rate-limit backend is temporarily unavailable.
   */
  failureMode?: RateLimitFailureMode | undefined;
  /** Maximum number of provisioning attempts allowed per issuer each minute. */
  issuerLimitPerMinute: number;
  /** Rate-limit store implementation used to persist counters. */
  store: RateLimitStore;
  /** Cooldown window (seconds) applied per `issuer:subject` pair. */
  subjectCooldownSeconds: number;
};

/**
 * Create a guard specialized for external-identity provisioning.
 *
 * The guard enforces both:
 * - issuer-wide throughput (`identity-provisioning-issuer`)
 * - per-subject cooldown (`identity-provisioning-subject`)
 *
 * @returns Guard function that resolves to `Ok<void>` when provisioning is allowed.
 *
 * @public
 */
export function createIdentityProvisioningRateLimitGuard({
  failureMode = "fail-open",
  issuerLimitPerMinute,
  store,
  subjectCooldownSeconds,
}: CreateIdentityProvisioningRateLimitGuardOptions): (
  claimSet: ExternalIdentityClaimSet,
) => ResultAsync<void, RichError> {
  return createRateLimitGuard<ExternalIdentityClaimSet>({
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
    failureMode,
    rules: [
      {
        id: "identity-provisioning-issuer",
        limit: issuerLimitPerMinute,
        resolveIdentifier: (claimSet) => claimSet.issuer,
        windowSeconds: 60,
      },
      {
        id: "identity-provisioning-subject",
        limit: 1,
        resolveIdentifier: (claimSet) =>
          `${claimSet.issuer}:${claimSet.subject}`,
        windowSeconds: subjectCooldownSeconds,
      },
    ],
    store,
  });
}
