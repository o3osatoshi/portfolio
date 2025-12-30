import { type ExchangeRateProvider, newExchangeRate } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetExchangeRateUseCase } from "./get-exchange-rate";

const h = vi.hoisted(() => {
  return {
    getRateMock: vi.fn(),
  };
});

describe("application/use-cases: GetExchangeRateUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getRateMock.mockReset();
  });

  const buildUseCase = () =>
    new GetExchangeRateUseCase({
      getRate: h.getRateMock,
    } as ExchangeRateProvider);

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

  it("normalizes currency codes and returns mapped response", async () => {
    const exchangeRate = buildExchangeRate({
      asOf: new Date("2025-02-03T04:05:06Z"),
      base: "USD",
      rate: 150.5,
      target: "JPY",
    });
    h.getRateMock.mockReturnValueOnce(okAsync(exchangeRate));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "usd", target: "jpy" });

    expect(h.getRateMock).toHaveBeenCalledTimes(1);
    expect(h.getRateMock).toHaveBeenCalledWith({
      base: "USD",
      target: "JPY",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(result.value.base).toBe("USD");
    expect(result.value.target).toBe("JPY");
    expect(result.value.rate).toBe(exchangeRate.rate);
    expect(result.value.asOf.getTime()).toBe(exchangeRate.asOf.getTime());
  });

  it("propagates provider errors", async () => {
    const providerError = new Error("provider failed");
    h.getRateMock.mockReturnValueOnce(errAsync(providerError));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", target: "JPY" });

    expect(h.getRateMock).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error).toBe(providerError);
  });

  it("returns validation error when base is invalid", async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "US", target: "JPY" });

    expect(h.getRateMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });

  it("returns validation error when target is invalid", async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", target: "JPYY" });

    expect(h.getRateMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });
});
