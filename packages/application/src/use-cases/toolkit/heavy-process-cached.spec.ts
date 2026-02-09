import type { CacheStore } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RichError } from "@o3osatoshi/toolkit";

import { newApplicationError } from "../../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../../application-error-catalog";
import type {
  HeavyProcessCachedResponse,
  HeavyProcessResponse,
} from "../../dtos/heavy-process.res.dto";
import { HeavyProcessCachedUseCase } from "./heavy-process-cached";

const h = vi.hoisted(() => {
  return {
    cacheGetMock: vi.fn(),
    cacheSetMock: vi.fn(),
    heavyExecuteMock: vi.fn(),
  };
});

const CACHE_KEY = "edge:public:heavy";
const CACHE_TTL_MS = 200_000;

const testError = (reason: string) =>
  newApplicationError({
    code: applicationErrorCodes.INTERNAL,
    details: {
      action: "HeavyProcessCachedUseCaseSpec",
      reason,
    },
    i18n: { key: applicationErrorI18nKeys.INTERNAL },
    kind: "Internal",
  });

describe("application/use-cases: HeavyProcessCachedUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.cacheGetMock.mockReset();
    h.cacheSetMock.mockReset();
    h.heavyExecuteMock.mockReset();
  });

  const buildUseCase = () => {
    const cacheStore: CacheStore = {
      get: h.cacheGetMock,
      set: h.cacheSetMock,
    };
    const heavyProcess = {
      execute: h.heavyExecuteMock,
    };
    return new HeavyProcessCachedUseCase(cacheStore, heavyProcess);
  };

  it("returns cached response when value exists in cache", async () => {
    const cachedTimestamp = new Date("2025-01-01T00:00:00Z");

    h.cacheGetMock.mockReturnValueOnce(
      okAsync<HeavyProcessResponse | null, RichError>({
        timestamp: cachedTimestamp,
      }),
    );

    const useCase = buildUseCase();
    const result = await useCase.execute();

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.cacheGetMock).toHaveBeenCalledWith(CACHE_KEY);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const payload: HeavyProcessCachedResponse = result.value;
    expect(payload.cached).toBe(true);
    expect(payload.timestamp).toEqual(cachedTimestamp);

    expect(h.heavyExecuteMock).not.toHaveBeenCalled();
    expect(h.cacheSetMock).not.toHaveBeenCalled();
  });

  it("runs heavy process and caches result when cache misses", async () => {
    const heavyTimestamp = new Date("2025-01-02T00:00:00Z");

    h.cacheGetMock.mockReturnValueOnce(okAsync<null, RichError>(null));
    h.heavyExecuteMock.mockReturnValueOnce(
      okAsync<HeavyProcessResponse, RichError>({ timestamp: heavyTimestamp }),
    );
    h.cacheSetMock.mockReturnValueOnce(okAsync<"OK" | null, RichError>("OK"));

    const useCase = buildUseCase();
    const result = await useCase.execute();

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.cacheGetMock).toHaveBeenCalledWith(CACHE_KEY);

    expect(h.heavyExecuteMock).toHaveBeenCalledTimes(1);

    expect(h.cacheSetMock).toHaveBeenCalledTimes(1);
    expect(h.cacheSetMock).toHaveBeenCalledWith(
      CACHE_KEY,
      { timestamp: heavyTimestamp },
      { ttlMs: CACHE_TTL_MS },
    );

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const payload: HeavyProcessCachedResponse = result.value;
    expect(payload.cached).toBe(false);
    expect(payload.timestamp).toEqual(heavyTimestamp);
  });

  it("falls back to heavy process when cache get fails", async () => {
    const cacheError = testError("cache get failed");
    const heavyTimestamp = new Date("2025-01-03T00:00:00Z");

    h.cacheGetMock.mockReturnValueOnce(
      errAsync<HeavyProcessResponse | null, RichError>(cacheError),
    );
    h.heavyExecuteMock.mockReturnValueOnce(
      okAsync<HeavyProcessResponse, RichError>({ timestamp: heavyTimestamp }),
    );
    h.cacheSetMock.mockReturnValueOnce(okAsync<"OK" | null, RichError>("OK"));

    const useCase = buildUseCase();
    const result = await useCase.execute();

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.heavyExecuteMock).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });

  it("propagates error when heavy process fails", async () => {
    h.cacheGetMock.mockReturnValueOnce(okAsync<null, RichError>(null));

    const heavyError = testError("heavy process failed");
    h.heavyExecuteMock.mockReturnValueOnce(
      errAsync<HeavyProcessResponse, RichError>(heavyError),
    );

    const useCase = buildUseCase();
    const result = await useCase.execute();

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.heavyExecuteMock).toHaveBeenCalledTimes(1);
    expect(h.cacheSetMock).not.toHaveBeenCalled();

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error).toBe(heavyError);
  });

  it("returns success even when cache set fails after heavy process", async () => {
    const heavyTimestamp = new Date("2025-01-04T00:00:00Z");

    h.cacheGetMock.mockReturnValueOnce(okAsync<null, RichError>(null));
    h.heavyExecuteMock.mockReturnValueOnce(
      okAsync<HeavyProcessResponse, RichError>({ timestamp: heavyTimestamp }),
    );

    const cacheSetError = testError("cache set failed");
    h.cacheSetMock.mockReturnValueOnce(
      errAsync<"OK" | null, RichError>(cacheSetError),
    );

    const useCase = buildUseCase();
    const result = await useCase.execute();

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.heavyExecuteMock).toHaveBeenCalledTimes(1);
    expect(h.cacheSetMock).toHaveBeenCalledTimes(1);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.cached).toBe(false);
  });
});
