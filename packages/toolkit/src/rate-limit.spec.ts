import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { newRichError } from "./error";
import {
  createRateLimitGuard,
  type RateLimitConsumeInput,
  type RateLimitStore,
} from "./rate-limit";

function createStore(
  consume: (
    input: RateLimitConsumeInput,
  ) => ReturnType<RateLimitStore["consume"]>,
): RateLimitStore {
  return { consume };
}

describe("rate-limit/createRateLimitGuard", () => {
  it("passes when all rules allow", async () => {
    const consume = vi.fn((input: RateLimitConsumeInput) =>
      okAsync({
        allowed: true,
        limit: input.limit,
        remaining: Math.max(0, input.limit - 1),
        resetEpochSeconds: 1000,
      }),
    );
    const guard = createRateLimitGuard<{
      issuer: string;
      subject: string;
    }>({
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: (input) => `${input.issuer}:${input.subject}`,
          windowSeconds: 300,
        },
        {
          id: "issuer",
          limit: 60,
          resolveIdentifier: (input) => input.issuer,
          windowSeconds: 60,
        },
      ],
      store: createStore(consume),
    });

    const result = await guard({
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });

    expect(result.isOk()).toBe(true);
    expect(consume).toHaveBeenNthCalledWith(1, {
      identifier: "https://example.auth0.com:auth0|123",
      bucket: "subject",
      limit: 1,
      windowSeconds: 300,
    });
    expect(consume).toHaveBeenNthCalledWith(2, {
      identifier: "https://example.auth0.com",
      bucket: "issuer",
      limit: 60,
      windowSeconds: 60,
    });
  });

  it("returns RateLimit error when one rule blocks", async () => {
    const consume = vi
      .fn<
        (input: RateLimitConsumeInput) => ReturnType<RateLimitStore["consume"]>
      >()
      .mockImplementationOnce((input) =>
        okAsync({
          allowed: false,
          limit: input.limit,
          remaining: 0,
          resetEpochSeconds: 2000,
        }),
      );
    const guard = createRateLimitGuard<{ key: string }>({
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: (input) => input.key,
          windowSeconds: 300,
        },
      ],
      store: createStore(consume),
    });

    const result = await guard({ key: "issuer:subject" });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.kind).toBe("RateLimit");
    expect(result.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("bypasses store failure when fail-open", async () => {
    const storeError = newRichError({
      code: "INT_RATE_LIMIT_CHECK_FAILED",
      details: { action: "CheckRateLimit", reason: "temporary outage" },
      isOperational: true,
      kind: "Unavailable",
      layer: "External",
    });
    const onBypass = vi.fn();
    const guard = createRateLimitGuard<{ id: string }>({
      failureMode: "fail-open",
      onBypass,
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: (input) => input.id,
          windowSeconds: 300,
        },
      ],
      store: createStore(() => errAsync(storeError)),
    });

    const result = await guard({ id: "auth0|123" });

    expect(result.isOk()).toBe(true);
    expect(onBypass).toHaveBeenCalledTimes(1);
  });

  it("returns store failure when fail-closed", async () => {
    const storeError = newRichError({
      code: "INT_RATE_LIMIT_CHECK_FAILED",
      details: { action: "CheckRateLimit", reason: "temporary outage" },
      isOperational: true,
      kind: "Unavailable",
      layer: "External",
    });
    const guard = createRateLimitGuard<{ id: string }>({
      failureMode: "fail-closed",
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: (input) => input.id,
          windowSeconds: 300,
        },
      ],
      store: createStore(() => errAsync(storeError)),
    });

    const result = await guard({ id: "auth0|123" });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.code).toBe("INT_RATE_LIMIT_CHECK_FAILED");
  });

  it("returns identifier error when resolveIdentifier throws", async () => {
    const consume = vi.fn((input: RateLimitConsumeInput) =>
      okAsync({
        allowed: true,
        limit: input.limit,
        remaining: input.limit,
        resetEpochSeconds: 1000,
      }),
    );
    const guard = createRateLimitGuard<{ id: string }>({
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: () => {
            throw new Error("boom");
          },
          windowSeconds: 300,
        },
      ],
      store: createStore(consume),
    });

    const result = await guard({ id: "auth0|123" });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.code).toBe("RATE_LIMIT_IDENTIFIER_INVALID");
    expect(consume).not.toHaveBeenCalled();
  });

  it("returns identifier error when resolveIdentifier returns non-string", async () => {
    const consume = vi.fn((input: RateLimitConsumeInput) =>
      okAsync({
        allowed: true,
        limit: input.limit,
        remaining: input.limit,
        resetEpochSeconds: 1000,
      }),
    );
    const guard = createRateLimitGuard<{ id: string }>({
      rules: [
        {
          id: "subject",
          limit: 1,
          resolveIdentifier: () => 123 as unknown as string,
          windowSeconds: 300,
        },
      ],
      store: createStore(consume),
    });

    const result = await guard({ id: "auth0|123" });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.code).toBe("RATE_LIMIT_IDENTIFIER_INVALID");
    expect(consume).not.toHaveBeenCalled();
  });
});
