import type { Redis } from "@upstash/redis";
import { describe, expect, it, vi } from "vitest";

import { kvGet, kvSet } from "./redis-cache";

describe("redis-cache kvGet", () => {
  it("returns ok with value when key exists", async () => {
    const redis = {
      get: vi.fn().mockResolvedValue({ foo: "bar" }),
    } as unknown as Redis;

    const resultAsync = kvGet<{ foo: string }>(redis, "user:1");
    const result = await resultAsync;

    expect(redis.get).toHaveBeenCalledWith("user:1");
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected kvGet to succeed");
    expect(result.value).toEqual({ foo: "bar" });
  });

  it("returns ok(null) when key is missing and applies prefix", async () => {
    const redis = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as Redis;

    const resultAsync = kvGet(redis, 42, { prefix: "cache" });
    const result = await resultAsync;

    expect(redis.get).toHaveBeenCalledWith("cache:42");
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected kvGet to succeed");
    expect(result.value).toBeNull();
  });

  it("maps Redis get failures to InfraUnavailableError with context", async () => {
    const cause = new Error("connection refused");
    const redis = {
      get: vi.fn().mockRejectedValue(cause),
    } as unknown as Redis;

    const resultAsync = kvGet(redis, "user:1");
    const result = await resultAsync;

    expect(redis.get).toHaveBeenCalledWith("user:1");
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected kvGet to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfraUnavailableError");
    expect(error).toHaveProperty("cause", cause);

    const payload = JSON.parse(error.message) as Record<string, unknown>;
    expect(payload["summary"]).toBe("KvGet failed");
    expect(payload["action"]).toBe("KvGet");
    expect(payload["reason"]).toBe(
      "Failed to get value from Redis key-value store",
    );
    expect(payload["hint"]).toBe(
      "Verify Redis connectivity or cache configuration.",
    );
    expect(payload["impact"]).toBe(
      "Cache read failed; the value could not be loaded from Redis.",
    );
  });
});

describe("redis-cache kvSet", () => {
  it("calls Redis set with key and default options and returns OK", async () => {
    const redis = {
      set: vi.fn().mockResolvedValue("OK"),
    } as unknown as Redis;

    const value = { foo: "bar" };
    const resultAsync = kvSet(redis, "user:1", value);
    const result = await resultAsync;

    expect(redis.set).toHaveBeenCalledWith("user:1", value, {});
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected kvSet to succeed");
    expect(result.value).toBe("OK");
  });

  it("applies ttl and conditional options and returns null when condition prevents write", async () => {
    const redis = {
      set: vi.fn().mockResolvedValue(null),
    } as unknown as Redis;

    const resultAsync = kvSet(
      redis,
      123,
      "value",
      { onlyIfAbsent: true, onlyIfPresent: false, ttlMs: 5_000 },
      { prefix: "cache" },
    );
    const result = await resultAsync;

    expect(redis.set).toHaveBeenCalledWith("cache:123", "value", {
      nx: true,
      px: 5_000,
      xx: false,
    });
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected kvSet to succeed");
    expect(result.value).toBeNull();
  });

  it("maps Redis set failures to InfraUnavailableError with context", async () => {
    const cause = new Error("network error");
    const redis = {
      set: vi.fn().mockRejectedValue(cause),
    } as unknown as Redis;

    const resultAsync = kvSet(redis, "user:1", { foo: "bar" });
    const result = await resultAsync;

    expect(redis.set).toHaveBeenCalledWith("user:1", { foo: "bar" }, {});
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected kvSet to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfraUnavailableError");
    expect(error).toHaveProperty("cause", cause);

    const payload = JSON.parse(error.message) as Record<string, unknown>;
    expect(payload["summary"]).toBe("KvSet failed");
    expect(payload["action"]).toBe("KvSet");
    expect(payload["reason"]).toBe(
      "Failed to set value in Redis key-value store",
    );
    expect(payload["hint"]).toBe(
      "Verify Redis connectivity or cache configuration.",
    );
    expect(payload["impact"]).toBe(
      "Cache write failed; the underlying operation may still have succeeded without caching.",
    );
  });
});
