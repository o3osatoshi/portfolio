import type { CacheStore, ExchangeRateProvider } from "@repo/domain";
import { newExchangeRate } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GetExchangeRateResponse } from "../../dtos";
import { GetExchangeRateCachedUseCase } from "./get-exchange-rate-cached";

const h = vi.hoisted(() => {
  return {
    providerGetRateMock: vi.fn(),
    cacheGetMock: vi.fn(),
    cacheSetMock: vi.fn(),
  };
});

const CACHE_KEY = "fx:rate:USD:JPY";
const CACHE_TTL_MS = 3_600_000;

describe("application/use-cases: GetExchangeRateCachedUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.cacheGetMock.mockReset();
    h.cacheSetMock.mockReset();
    h.providerGetRateMock.mockReset();
  });

  const buildExchangeRate = ({
    asOf = new Date("2025-01-01T00:00:00Z"),
    base = "USD",
    rate = 150.25,
    target = "JPY",
  }: {
    asOf?: Date;
    base?: string;
    rate?: number | string;
    target?: string;
  } = {}) => {
    const res = newExchangeRate({ asOf, base, rate, target });
    if (res.isErr()) {
      throw res.error;
    }
    return res.value;
  };

  const buildUseCase = () => {
    const cacheStore: CacheStore = {
      get: h.cacheGetMock,
      set: h.cacheSetMock,
    };
    const provider: ExchangeRateProvider = {
      getRate: h.providerGetRateMock,
    };
    return new GetExchangeRateCachedUseCase(provider, cacheStore);
  };

  it("returns cached response when available", async () => {
    const cached: GetExchangeRateResponse = {
      asOf: new Date("2025-02-01T00:00:00Z"),
      base: "USD",
      rate: "150.0",
      target: "JPY",
    };
    h.cacheGetMock.mockReturnValueOnce(okAsync(cached));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "usd", target: "jpy" });

    expect(h.cacheGetMock).toHaveBeenCalledTimes(1);
    expect(h.cacheGetMock).toHaveBeenCalledWith(CACHE_KEY);
    expect(h.providerGetRateMock).not.toHaveBeenCalled();
    expect(h.cacheSetMock).not.toHaveBeenCalled();

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value).toEqual(cached);
  });

  it("fetches provider and caches response on miss", async () => {
    const exchangeRate = buildExchangeRate();
    h.cacheGetMock.mockReturnValueOnce(okAsync(null));
    h.providerGetRateMock.mockReturnValueOnce(okAsync(exchangeRate));
    h.cacheSetMock.mockReturnValueOnce(okAsync("OK"));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "usd", target: "jpy" });

    expect(h.cacheGetMock).toHaveBeenCalledWith(CACHE_KEY);
    expect(h.providerGetRateMock).toHaveBeenCalledTimes(1);
    expect(h.providerGetRateMock).toHaveBeenCalledWith({
      base: "USD",
      target: "JPY",
    });
    expect(h.cacheSetMock).toHaveBeenCalledTimes(1);
    expect(h.cacheSetMock).toHaveBeenCalledWith(
      CACHE_KEY,
      result.isOk() ? result.value : expect.anything(),
      { ttlMs: CACHE_TTL_MS },
    );

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.base).toBe("USD");
    expect(result.value.target).toBe("JPY");
  });

  it("falls back to provider when cache read fails", async () => {
    h.cacheGetMock.mockReturnValueOnce(
      errAsync<GetExchangeRateResponse | null, Error>(
        new Error("cache get failed"),
      ),
    );
    const exchangeRate = buildExchangeRate();
    h.providerGetRateMock.mockReturnValueOnce(okAsync(exchangeRate));
    h.cacheSetMock.mockReturnValueOnce(okAsync("OK"));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", target: "JPY" });

    expect(h.providerGetRateMock).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });

  it("returns response even when cache write fails", async () => {
    h.cacheGetMock.mockReturnValueOnce(okAsync(null));
    const exchangeRate = buildExchangeRate();
    h.providerGetRateMock.mockReturnValueOnce(okAsync(exchangeRate));
    h.cacheSetMock.mockReturnValueOnce(
      errAsync<"OK" | null, Error>(new Error("cache set failed")),
    );

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", target: "JPY" });

    expect(h.providerGetRateMock).toHaveBeenCalledTimes(1);
    expect(h.cacheSetMock).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });

  it("propagates provider errors", async () => {
    h.cacheGetMock.mockReturnValueOnce(okAsync(null));
    const providerError = new Error("provider failed");
    h.providerGetRateMock.mockReturnValueOnce(errAsync(providerError));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", target: "JPY" });

    expect(h.cacheSetMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error).toBe(providerError);
  });

  it("returns validation error before touching cache on invalid input", async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "US", target: "JPY" });

    expect(h.cacheGetMock).not.toHaveBeenCalled();
    expect(h.providerGetRateMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });
});
