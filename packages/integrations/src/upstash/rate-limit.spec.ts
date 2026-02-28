import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    rejection: null as Error | null,
    response: {
      limit: 60,
      remaining: 59,
      reset: 1_700_000_000_000,
      success: true,
    },
  };
  const instances: Array<{
    config: unknown;
    limit: ReturnType<typeof vi.fn>;
  }> = [];
  const RedisMock = vi.fn(function RedisMock(
    this: { options: unknown },
    options: unknown,
  ) {
    this.options = options;
  });
  const fixedWindowMock = vi.fn((limit: number, window: string) => ({
    kind: "fixed-window",
    limit,
    window,
  }));
  const RatelimitMock = vi.fn(function RatelimitMock(
    this: { config: unknown; limit: ReturnType<typeof vi.fn> },
    config: unknown,
  ) {
    const limit = vi.fn(() => {
      if (state.rejection) {
        return Promise.reject(state.rejection);
      }
      return Promise.resolve(state.response);
    });
    this.config = config;
    this.limit = limit;
    instances.push({ config, limit });
  });
  Object.assign(RatelimitMock, {
    fixedWindow: fixedWindowMock,
  });
  return {
    fixedWindowMock,
    instances,
    RatelimitMock,
    RedisMock,
    state,
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: h.RedisMock,
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: h.RatelimitMock,
}));

import { createUpstashRateLimitStore } from "./rate-limit";

describe("integrations/upstash rate-limit store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.instances.length = 0;
    h.state.rejection = null;
    h.state.response = {
      limit: 60,
      remaining: 59,
      reset: 1_700_000_000_000,
      success: true,
    };
  });

  it("maps Upstash decision to RateLimitDecision", async () => {
    const store = createUpstashRateLimitStore({
      token: "token-1",
      url: "https://example.upstash.io",
    });

    const result = await store.consume({
      identifier: "https://example.auth0.com",
      bucket: "cli-identity-issuer",
      limit: 60,
      windowSeconds: 60,
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(h.instances[0]?.limit).toHaveBeenCalledWith(
      "https://example.auth0.com",
    );
    expect(result.value).toEqual({
      allowed: true,
      limit: 60,
      remaining: 59,
      resetEpochSeconds: 1_700_000_000,
    });
  });

  it("reuses limiter instance for the same bucket/limit/window", async () => {
    const store = createUpstashRateLimitStore({
      token: "token-1",
      url: "https://example.upstash.io",
    });

    await store.consume({
      identifier: "issuer-a",
      bucket: "cli-identity-issuer",
      limit: 60,
      windowSeconds: 60,
    });
    await store.consume({
      identifier: "issuer-b",
      bucket: "cli-identity-issuer",
      limit: 60,
      windowSeconds: 60,
    });

    expect(h.RatelimitMock).toHaveBeenCalledTimes(1);
    expect(h.fixedWindowMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes Upstash errors", async () => {
    h.state.rejection = new Error("upstash unavailable");
    const store = createUpstashRateLimitStore({
      token: "token-1",
      url: "https://example.upstash.io",
    });

    const result = await store.consume({
      identifier: "issuer-a",
      bucket: "cli-identity-issuer",
      limit: 60,
      windowSeconds: 60,
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.code).toBe("INT_RATE_LIMIT_CHECK_FAILED");
    expect(result.error.kind).toBe("Unavailable");
  });
});
