import type { ExternalIdentityClaimSet } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { newRichError, type RateLimitConsumeInput } from "@o3osatoshi/toolkit";

import { createIdentityProvisioningRateLimitGuard } from "./identity-provisioning-rate-limit-guard";

function createClaimSet(
  overrides: Partial<ExternalIdentityClaimSet> = {},
): ExternalIdentityClaimSet {
  return {
    name: "Ada",
    email: "ada@example.com",
    emailVerified: true,
    image: "https://example.com/ada.png",
    issuer: "https://issuer.example.com",
    subject: "auth0|123",
    ...overrides,
  } as ExternalIdentityClaimSet;
}

describe("hono-auth/identity-provisioning-rate-limit-guard", () => {
  it("applies issuer and subject rules in order when allowed", async () => {
    const consume = vi.fn((input: RateLimitConsumeInput) =>
      okAsync({
        allowed: true,
        limit: input.limit,
        remaining: Math.max(input.limit - 1, 0),
        resetEpochSeconds: 1_000,
      }),
    );
    const guard = createIdentityProvisioningRateLimitGuard({
      issuerLimitPerMinute: 15,
      store: { consume },
      subjectCooldownSeconds: 90,
    });

    const claimSet = createClaimSet();
    const result = await guard(claimSet);

    expect(result.isOk()).toBe(true);
    expect(consume).toHaveBeenCalledTimes(2);
    expect(consume).toHaveBeenNthCalledWith(1, {
      identifier: claimSet.issuer,
      bucket: "identity-provisioning-issuer",
      limit: 15,
      windowSeconds: 60,
    });
    expect(consume).toHaveBeenNthCalledWith(2, {
      identifier: `${claimSet.issuer}:${claimSet.subject}`,
      bucket: "identity-provisioning-subject",
      limit: 1,
      windowSeconds: 90,
    });
  });

  it("returns CLI_IDENTITY_RATE_LIMITED and stops chaining when issuer rule is exceeded", async () => {
    const consume = vi.fn((input: RateLimitConsumeInput) =>
      okAsync({
        allowed: false,
        limit: input.limit,
        remaining: 0,
        resetEpochSeconds: 2_000,
      }),
    );
    const guard = createIdentityProvisioningRateLimitGuard({
      issuerLimitPerMinute: 10,
      store: { consume },
      subjectCooldownSeconds: 120,
    });

    const result = await guard(createClaimSet());

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe("CLI_IDENTITY_RATE_LIMITED");
      expect(result.error.details?.action).toBe(
        "CheckIdentityProvisioningRateLimit",
      );
      expect(result.error.details?.reason).toContain(
        "identity-provisioning-issuer",
      );
    }
    expect(consume).toHaveBeenCalledTimes(1);
  });

  it("defaults to fail-open when store lookup fails", async () => {
    const storeError = newRichError({
      code: "RATE_LIMIT_CHECK_FAILED",
      details: {
        action: "ConsumeRateLimit",
        reason: "store unavailable",
      },
      isOperational: true,
      kind: "Unavailable",
      layer: "Application",
    });
    const consume = vi.fn(() => errAsync(storeError));
    const guard = createIdentityProvisioningRateLimitGuard({
      issuerLimitPerMinute: 8,
      store: { consume },
      subjectCooldownSeconds: 30,
    });

    const result = await guard(createClaimSet());

    expect(result.isOk()).toBe(true);
    expect(consume).toHaveBeenCalledTimes(2);
  });

  it("returns store errors in fail-closed mode", async () => {
    const storeError = newRichError({
      code: "RATE_LIMIT_CHECK_FAILED",
      details: {
        action: "ConsumeRateLimit",
        reason: "store unavailable",
      },
      isOperational: true,
      kind: "Unavailable",
      layer: "Application",
    });
    const consume = vi.fn(() => errAsync(storeError));
    const guard = createIdentityProvisioningRateLimitGuard({
      failureMode: "fail-closed",
      issuerLimitPerMinute: 8,
      store: { consume },
      subjectCooldownSeconds: 30,
    });

    const result = await guard(createClaimSet());

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBe(storeError);
    }
    expect(consume).toHaveBeenCalledTimes(1);
  });
});
