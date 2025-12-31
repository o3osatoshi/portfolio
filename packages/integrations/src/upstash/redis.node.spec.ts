import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const RedisMock = vi.fn(function RedisMock(
    this: { options: unknown; tag: string },
    options: unknown,
  ) {
    this.options = options;
    this.tag = "redis";
  });
  return { RedisMock };
});

vi.mock("@upstash/redis", () => ({
  Redis: h.RedisMock,
}));

import { createUpstashRedis } from "./redis.node";

describe("integrations/upstash createUpstashRedis (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Redis client with provided token and url", () => {
    const store = createUpstashRedis({
      token: "token-123",
      url: "https://example.upstash.io",
    });

    expect(h.RedisMock).toHaveBeenCalledTimes(1);
    expect(h.RedisMock).toHaveBeenCalledWith({
      token: "token-123",
      url: "https://example.upstash.io",
    });
    expect(typeof store.get).toBe("function");
    expect(typeof store.set).toBe("function");
  });

  it("passes undefined token and url when options are omitted", () => {
    createUpstashRedis();

    expect(h.RedisMock).toHaveBeenCalledTimes(1);
    expect(h.RedisMock).toHaveBeenCalledWith({
      token: undefined,
      url: undefined,
    });
  });
});
