import { type FxQuoteProvider, newFxQuote } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newApplicationError } from "../../application-error";
import { applicationErrorCodes } from "../../application-error-catalog";
import { GetFxQuoteUseCase } from "./get-fx-quote";

const h = vi.hoisted(() => {
  return {
    getRateMock: vi.fn(),
  };
});

describe("application/use-cases: GetFxQuoteUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getRateMock.mockReset();
  });

  const buildUseCase = () =>
    new GetFxQuoteUseCase({
      getRate: h.getRateMock,
    } as FxQuoteProvider);

  const buildFxQuote = ({
    asOf = new Date("2025-01-01T00:00:00Z"),
    base = "USD",
    quote = "JPY",
    rate = 150.25,
  }: {
    asOf?: Date;
    base?: string;
    quote?: string;
    rate?: number | string;
  } = {}) => {
    const res = newFxQuote({ asOf, base, quote, rate });
    if (res.isErr()) {
      throw res.error;
    }
    return res.value;
  };

  it("normalizes currency codes and returns mapped response", async () => {
    const fxQuote = buildFxQuote({
      asOf: new Date("2025-02-03T04:05:06Z"),
      base: "USD",
      quote: "JPY",
      rate: 150.5,
    });
    h.getRateMock.mockReturnValueOnce(okAsync(fxQuote));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "usd", quote: "jpy" });

    expect(h.getRateMock).toHaveBeenCalledTimes(1);
    expect(h.getRateMock).toHaveBeenCalledWith({
      base: "USD",
      quote: "JPY",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(result.value.base).toBe("USD");
    expect(result.value.quote).toBe("JPY");
    expect(result.value.rate).toBe(fxQuote.rate);
    expect(result.value.asOf.getTime()).toBe(fxQuote.asOf.getTime());
  });

  it("propagates provider errors", async () => {
    const providerError = newApplicationError({
      code: applicationErrorCodes.UNAVAILABLE,
      details: {
        action: "GetFxQuoteUseCaseSpec",
        reason: "provider failed",
      },
      kind: "Unavailable",
    });
    h.getRateMock.mockReturnValueOnce(errAsync(providerError));

    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", quote: "JPY" });

    expect(h.getRateMock).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error).toBe(providerError);
  });

  it("returns validation error when base is invalid", async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "US", quote: "JPY" });

    expect(h.getRateMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });

  it("returns validation error when quote is invalid", async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ base: "USD", quote: "JPYY" });

    expect(h.getRateMock).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });
});
