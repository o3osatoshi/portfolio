import { describe, expect, it } from "vitest";

import { newFxQuote, newFxRate } from "./fx-quote";

describe("value-objects/fx-quote", () => {
  it("FxRate must be > 0", () => {
    const ok = newFxRate("1.25");
    const zero = newFxRate(0);
    const zeroDecimal = newFxRate("0.0");
    const neg = newFxRate("-0.1");
    expect(ok.isOk()).toBe(true);
    expect(zero.isErr()).toBe(true);
    expect(zeroDecimal.isErr()).toBe(true);
    expect(neg.isErr()).toBe(true);
  });

  it("newFxQuote validates and normalizes fields", () => {
    const res = newFxQuote({
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
