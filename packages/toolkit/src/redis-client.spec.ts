import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const RedisMock = vi.fn((options: unknown) => ({
    options,
    tag: "redis",
  }));
  const EdgeRedisMock = vi.fn((options: unknown) => ({
    options,
    tag: "edge-redis",
  }));
  return { EdgeRedisMock, RedisMock };
});

vi.mock("@upstash/redis", () => ({
  Redis: h.RedisMock,
}));

vi.mock("@upstash/redis/cloudflare", () => ({
  Redis: h.EdgeRedisMock,
}));

import { createEdgeRedisClient, createRedisClient } from "./redis-client";

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

describe("redis-client/createEdgeRedisClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Cloudflare Redis client with provided token and url", () => {
    const client = createEdgeRedisClient({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });
    expect(h.RedisMock).not.toHaveBeenCalled();
    // @ts-expect-error mock exposes internal test-only tag
    expect(client.tag).toBe("edge-redis");
    // @ts-expect-error mock exposes internal test-only options
    expect(client.options).toEqual({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });
  });

  it("passes undefined token and url when options are omitted", () => {
    const client = createEdgeRedisClient();

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
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
    createEdgeRedisClient({ token: "edge-only-token" });
    createEdgeRedisClient({ url: "https://edge-only-url.upstash.io" });

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(2);
    expect(h.EdgeRedisMock).toHaveBeenNthCalledWith(1, {
      token: "edge-only-token",
      url: undefined,
    });
    expect(h.EdgeRedisMock).toHaveBeenNthCalledWith(2, {
      token: undefined,
      url: "https://edge-only-url.upstash.io",
    });
  });
});
