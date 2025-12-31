import { describe, expect, it } from "vitest";

import { newExchangeRate, newExchangeRateValue } from "./exchange-rate";

describe("value-objects/exchange-rate", () => {
  it("ExchangeRateValue must be > 0", () => {
    const ok = newExchangeRateValue("1.25");
    const zero = newExchangeRateValue(0);
    const zeroDecimal = newExchangeRateValue("0.0");
    const neg = newExchangeRateValue("-0.1");
    expect(ok.isOk()).toBe(true);
    expect(zero.isErr()).toBe(true);
    expect(zeroDecimal.isErr()).toBe(true);
    expect(neg.isErr()).toBe(true);
  });

  it("newExchangeRate validates and normalizes fields", () => {
    const res = newExchangeRate({
      asOf: new Date("2024-01-01"),
      base: "usd",
      quote: "jpy",
      rate: "140.01",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.base).toBe("USD");
      expect(res.value.quote).toBe("JPY");
    }
  });
});
