import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const RedisMock = vi.fn((options: unknown) => ({
    options,
    tag: "redis",
  }));
  return { RedisMock };
});

vi.mock("@upstash/redis", () => ({
  Redis: h.RedisMock,
}));

import { createRedisClient } from "./redis-client";

describe("redis-client/createRedisClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Redis client with provided token and url", () => {
    const client = createRedisClient({
      token: "token-123",
      url: "https://example.upstash.io",
    });

    expect(h.RedisMock).toHaveBeenCalledTimes(1);
    expect(h.RedisMock).toHaveBeenCalledWith({
      token: "token-123",
      url: "https://example.upstash.io",
    });
    // @ts-expect-error mock exposes internal test-only tag
    expect(client.tag).toBe("redis");
    // @ts-expect-error mock exposes internal test-only options
    expect(client.options).toEqual({
      token: "token-123",
      url: "https://example.upstash.io",
    });
  });

  it("passes undefined token and url when options are omitted", () => {
    const client = createRedisClient();

    expect(h.RedisMock).toHaveBeenCalledTimes(1);
    expect(h.RedisMock).toHaveBeenCalledWith({
      token: undefined,
      url: undefined,
    });
    // @ts-expect-error mock exposes internal test-only options
    expect(client.options).toEqual({
      token: undefined,
      url: undefined,
    });
  });

  it("supports partial options (token only or url only)", () => {
    createRedisClient({ token: "only-token" });
    createRedisClient({ url: "https://only-url.upstash.io" });

    expect(h.RedisMock).toHaveBeenCalledTimes(2);
    expect(h.RedisMock).toHaveBeenNthCalledWith(1, {
      token: "only-token",
      url: undefined,
    });
    expect(h.RedisMock).toHaveBeenNthCalledWith(2, {
      token: undefined,
      url: "https://only-url.upstash.io",
    });
  });
});
