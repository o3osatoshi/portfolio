import type { CacheStore } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { withCache } from "./with-cache";

const buildResponse = <T>(data: T, attempts = 1, ok = true) =>
  okAsync({
    data,
    response: {
      headers: new Headers(),
      ok,
      status: ok ? 200 : 500,
      statusText: ok ? "OK" : "ERR",
      url: "https://example.test",
    },
    retry: { attempts },
  });

describe("integrations/http withCache", () => {
  it("passes through when no store is provided", async () => {
    const next = vi.fn(() => buildResponse("fresh"));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("skips cache when getKey returns undefined", async () => {
    const cacheStore: CacheStore = {
      // @ts-expect-error
      get: vi.fn(() => okAsync("cached")),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse("fresh"));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => undefined,
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(cacheStore.get).not.toHaveBeenCalled();
    expect(cacheStore.set).not.toHaveBeenCalled();
  });

  it("returns cached data on cache hits", async () => {
    const cacheStore: CacheStore = {
      // @ts-expect-error
      get: vi.fn(() => okAsync({ value: "cached" })),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(next).not.toHaveBeenCalled();
    expect(result.value.cache?.hit).toBe(true);
    expect(result.value.cache?.key).toBe("cache:key");
    expect(result.value.data).toEqual({ value: "cached" });
  });

  it("writes to cache on cache miss", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(() => okAsync(null)),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }, 2));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      store: cacheStore,
      ttlMs: 1000,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(cacheStore.set).toHaveBeenCalledWith(
      "cache:key",
      { value: "fresh" },
      { ttlMs: 1000 },
    );
    if (!result.isOk()) return;
    expect(result.value.cache?.hit).toBe(false);
    expect(result.value.cache?.key).toBe("cache:key");
    expect(result.value.retry?.attempts).toBe(2);
  });

  it("skips caching when shouldCache returns false", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(() => okAsync(null)),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      shouldCache: () => undefined,
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(cacheStore.set).not.toHaveBeenCalled();
  });

  it("falls back to fetch when cached data cannot be deserialized", async () => {
    const cacheStore: CacheStore = {
      // @ts-expect-error
      get: vi.fn(() => okAsync("bad-data")),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      deserialize: () => {
        throw new Error("bad cache");
      },
      getKey: () => "cache:key",
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(cacheStore.set).toHaveBeenCalledTimes(1);
  });

  it("falls back to fetch when cache get fails", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(() => errAsync(new Error("cache get failed"))),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ignores cache set failures", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(() => okAsync(null)),
      set: vi.fn(() => errAsync(new Error("cache set failed"))),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      store: cacheStore,
      ttlMs: 1000,
    });

    // @ts-expect-error
    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(cacheStore.set).toHaveBeenCalledTimes(1);
  });

  it("skips cache when request cache is disabled", async () => {
    const cacheStore: CacheStore = {
      // @ts-expect-error
      get: vi.fn(() => okAsync({ value: "cached" })),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const next = vi.fn(() => buildResponse({ value: "fresh" }));
    // @ts-expect-error
    const client = withCache(next, {
      getKey: () => "cache:key",
      store: cacheStore,
    });

    // @ts-expect-error
    const result = await client({
      cache: undefined,
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(cacheStore.get).not.toHaveBeenCalled();
  });
});
