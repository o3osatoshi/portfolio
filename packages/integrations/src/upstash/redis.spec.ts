import { describe, expect, it, vi } from "vitest";

import { wrapUpstashRedis } from "./redis";

describe("integrations/upstash wrapUpstashRedis (shared)", () => {
  it("returns cached value when get resolves", async () => {
    const client = {
      get: vi.fn(() => Promise.resolve("value")),
      set: vi.fn(),
    };
    // @ts-expect-error
    const store = wrapUpstashRedis(client);

    const result = await store.get("cache:key");

    expect(client.get).toHaveBeenCalledWith("cache:key");
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value).toBe("value");
  });

  it("returns null when cache key is missing", async () => {
    const client = {
      get: vi.fn(() => Promise.resolve(null)),
      set: vi.fn(),
    };
    const store = wrapUpstashRedis(client);

    const result = await store.get("cache:key");

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value).toBeNull();
  });

  it("maps ttlMs to px when writing", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.resolve("OK")),
    };
    // @ts-expect-error
    const store = wrapUpstashRedis(client);

    const result = await store.set(
      "cache:key",
      { foo: "bar" },
      { ttlMs: 1000 },
    );

    expect(client.set).toHaveBeenCalledWith(
      "cache:key",
      { foo: "bar" },
      { px: 1000 },
    );
    expect(result.isOk()).toBe(true);
  });

  it("maps onlyIfAbsent to nx when writing", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.resolve("OK")),
    };
    // @ts-expect-error
    const store = wrapUpstashRedis(client);

    const result = await store.set(
      "cache:key",
      { foo: "bar" },
      { onlyIfAbsent: true },
    );

    expect(client.set).toHaveBeenCalledWith(
      "cache:key",
      { foo: "bar" },
      { nx: true },
    );
    expect(result.isOk()).toBe(true);
  });

  it("maps onlyIfPresent to xx when writing", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.resolve("OK")),
    };
    // @ts-expect-error
    const store = wrapUpstashRedis(client);

    const result = await store.set(
      "cache:key",
      { foo: "bar" },
      { onlyIfPresent: true },
    );

    expect(client.set).toHaveBeenCalledWith(
      "cache:key",
      { foo: "bar" },
      { xx: true },
    );
    expect(result.isOk()).toBe(true);
  });

  it("passes combined cache flags when provided", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.resolve("OK")),
    };
    // @ts-expect-error
    const store = wrapUpstashRedis(client);

    const result = await store.set(
      "cache:key",
      { foo: "bar" },
      { onlyIfAbsent: true, onlyIfPresent: true, ttlMs: 2000 },
    );

    expect(client.set).toHaveBeenCalledWith(
      "cache:key",
      { foo: "bar" },
      { nx: true, px: 2000, xx: true },
    );
    expect(result.isOk()).toBe(true);
  });

  it("returns error when get rejects", async () => {
    const client = {
      get: vi.fn(() => Promise.reject(new Error("get failed"))),
      set: vi.fn(),
    };
    const store = wrapUpstashRedis(client);

    const result = await store.get("cache:key");

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("InfraUnavailableError");
  });

  it("returns error when set rejects", async () => {
    const client = {
      get: vi.fn(),
      set: vi.fn(() => Promise.reject(new Error("set failed"))),
    };
    const store = wrapUpstashRedis(client);

    const result = await store.set("cache:key", "value");

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("InfraUnavailableError");
  });
});
