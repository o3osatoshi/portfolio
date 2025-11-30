import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    kvGetMock: vi.fn(),
    kvSetMock: vi.fn(),
    sleepMock: vi.fn(),
  };
});

vi.mock("@o3osatoshi/toolkit", () => ({
  kvGet: h.kvGetMock,
  kvSet: h.kvSetMock,
  sleep: h.sleepMock,
}));

import type { HeavyProcessCachedResponse } from "../../dtos/heavy-process.res.dto";
import { HeavyProcessCachedUseCase } from "./heavy-process-cached";

const CACHE_KEY = "edge:public:heavy";
const CACHE_TTL_MS = 200_000;

describe("application/use-cases: HeavyProcessCachedUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.kvGetMock.mockReset();
    h.kvSetMock.mockReset();
    h.sleepMock.mockReset();
  });

  it("returns cached response when value exists in Redis", async () => {
    const cachedTimestamp = new Date("2025-01-01T00:00:00Z");

    h.kvGetMock.mockReturnValueOnce(
      okAsync<{ timestamp: Date } | null, Error>({
        timestamp: cachedTimestamp,
      }),
    );

    const redis = {} as unknown as Record<string, unknown>;
    const useCase = new HeavyProcessCachedUseCase(
      // @ts-expect-error
      redis as unknown as Parameters<typeof HeavyProcessCachedUseCase>[0],
    );

    const result = await useCase.execute();

    expect(h.kvGetMock).toHaveBeenCalledTimes(1);
    expect(h.kvGetMock).toHaveBeenCalledWith(redis, CACHE_KEY);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const payload: HeavyProcessCachedResponse = result.value;
    expect(payload.cached).toBe(true);
    expect(payload.timestamp).toEqual(cachedTimestamp);

    expect(h.sleepMock).not.toHaveBeenCalled();
    expect(h.kvSetMock).not.toHaveBeenCalled();
  });

  it("runs heavy process and caches result when no cached value exists", async () => {
    h.kvGetMock.mockReturnValueOnce(okAsync<null, Error>(null));

    h.sleepMock.mockReturnValueOnce(okAsync<void, Error>(undefined));

    h.kvSetMock.mockReturnValueOnce(
      okAsync<"OK" | { timestamp: Date } | null, Error>("OK"),
    );

    const redis = {} as unknown as Record<string, unknown>;
    const useCase = new HeavyProcessCachedUseCase(
      // @ts-expect-error
      redis as unknown as Parameters<typeof HeavyProcessCachedUseCase>[0],
    );

    const before = new Date();
    const result = await useCase.execute();
    const after = new Date();

    expect(h.kvGetMock).toHaveBeenCalledTimes(1);
    expect(h.kvGetMock).toHaveBeenCalledWith(redis, CACHE_KEY);

    expect(h.sleepMock).toHaveBeenCalledTimes(1);
    expect(h.sleepMock.mock.calls[0]?.[0]).toBe(3_000);

    expect(h.kvSetMock).toHaveBeenCalledTimes(1);
    const [, keyArg, storedValue, setOptions] = h.kvSetMock.mock.calls[0] ?? [];
    expect(keyArg).toBe(CACHE_KEY);
    expect(setOptions).toEqual({ ttlMs: CACHE_TTL_MS });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const payload: HeavyProcessCachedResponse = result.value;
    expect(payload.cached).toBe(false);
    expect(payload.timestamp).toBeInstanceOf(Date);
    expect(payload.timestamp.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(payload.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());

    if (storedValue && typeof storedValue === "object") {
      expect((storedValue as { timestamp: Date }).timestamp).toEqual(
        payload.timestamp,
      );
    }
  });

  it("propagates error when kvGet fails", async () => {
    const kvError = new Error("kvGet failed");
    h.kvGetMock.mockReturnValueOnce(errAsync<null, Error>(kvError));

    const redis = {} as unknown as Record<string, unknown>;
    const useCase = new HeavyProcessCachedUseCase(
      // @ts-expect-error
      redis as unknown as Parameters<typeof HeavyProcessCachedUseCase>[0],
    );

    const result = await useCase.execute();

    expect(h.kvGetMock).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBe(kvError);
    expect(h.sleepMock).not.toHaveBeenCalled();
    expect(h.kvSetMock).not.toHaveBeenCalled();
  });

  it("propagates error when sleep fails after cache miss", async () => {
    h.kvGetMock.mockReturnValueOnce(okAsync<null, Error>(null));

    const sleepError = new Error("sleep aborted");
    h.sleepMock.mockReturnValueOnce(errAsync<void, Error>(sleepError));

    const redis = {} as unknown as Record<string, unknown>;
    const useCase = new HeavyProcessCachedUseCase(
      // @ts-expect-error
      redis as unknown as Parameters<typeof HeavyProcessCachedUseCase>[0],
    );

    const result = await useCase.execute();

    expect(h.kvGetMock).toHaveBeenCalledTimes(1);
    expect(h.sleepMock).toHaveBeenCalledTimes(1);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBe(sleepError);
    expect(h.kvSetMock).not.toHaveBeenCalled();
  });

  it("propagates error when kvSet fails after heavy process", async () => {
    h.kvGetMock.mockReturnValueOnce(okAsync<null, Error>(null));

    h.sleepMock.mockReturnValueOnce(okAsync<void, Error>(undefined));

    const kvSetError = new Error("kvSet failed");
    h.kvSetMock.mockReturnValueOnce(errAsync<"OK" | null, Error>(kvSetError));

    const redis = {} as unknown as Record<string, unknown>;
    const useCase = new HeavyProcessCachedUseCase(
      // @ts-expect-error
      redis as unknown as Parameters<typeof HeavyProcessCachedUseCase>[0],
    );

    const result = await useCase.execute();

    expect(h.kvGetMock).toHaveBeenCalledTimes(1);
    expect(h.sleepMock).toHaveBeenCalledTimes(1);
    expect(h.kvSetMock).toHaveBeenCalledTimes(1);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBe(kvSetError);
  });
});
