import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const RedisMock = vi.fn(function RedisMock(
    this: { options: unknown; tag: string },
    options: unknown,
  ) {
    this.options = options;
    this.tag = "redis";
  });
  const EdgeRedisMock = vi.fn(function EdgeRedisMock(
    this: { options: unknown; tag: string },
    options: unknown,
  ) {
    this.options = options;
    this.tag = "edge-redis";
  });
  return { EdgeRedisMock, RedisMock };
});

vi.mock("@upstash/redis", () => ({
  Redis: h.RedisMock,
}));

vi.mock("@upstash/redis/cloudflare", () => ({
  Redis: h.EdgeRedisMock,
}));

import {
  createEdgeUpstashCacheStore,
  createUpstashCacheStore,
  wrapUpstashClient,
} from "./upstash-cache-store";

describe("integrations/redis createUpstashCacheStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Redis client with provided token and url", () => {
    const store = createUpstashCacheStore({
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
    createUpstashCacheStore();

    expect(h.RedisMock).toHaveBeenCalledTimes(1);
    expect(h.RedisMock).toHaveBeenCalledWith({
      token: undefined,
      url: undefined,
    });
  });
});

describe("integrations/redis createEdgeUpstashCacheStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an Edge Redis client with provided token and url", () => {
    createEdgeUpstashCacheStore({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });
  });

  it("passes undefined token and url when options are omitted", () => {
    createEdgeUpstashCacheStore();

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
      token: undefined,
      url: undefined,
    });
  });
});

describe("integrations/redis wrapUpstashClient", () => {
  it("returns cached value when get resolves", async () => {
    const client = {
      get: vi.fn(() => Promise.resolve("value")),
      set: vi.fn(),
    };
    const store = wrapUpstashClient(client);

    const result = await store.get("cache:key");

    expect(client.get).toHaveBeenCalledWith("cache:key");
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value).toBe("value");
  });

  it("maps cache options to Upstash flags", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.resolve("OK")),
    };
    const store = wrapUpstashClient(client);

    const result = await store.set("cache:key", { foo: "bar" }, {
      ttlMs: 1_000,
      onlyIfAbsent: true,
    });

    expect(client.set).toHaveBeenCalledWith(
      "cache:key",
      { foo: "bar" },
      { px: 1_000, nx: true },
    );
    expect(result.isOk()).toBe(true);
  });

  it("returns error when get rejects", async () => {
    const client = {
      get: vi.fn(() => Promise.reject(new Error("get failed"))),
      set: vi.fn(),
    };
    const store = wrapUpstashClient(client);

    const result = await store.get("cache:key");

    expect(result.isErr()).toBe(true);
  });

  it("returns error when set rejects", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.reject(new Error("set failed"))),
    };
    const store = wrapUpstashClient(client);

    const result = await store.set("cache:key", "value");

    expect(result.isErr()).toBe(true);
  });
});
