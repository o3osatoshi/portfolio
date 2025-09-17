import { describe, expect, it } from "vitest";

import { isCurrencyCode, newCurrencyCode } from "./currency";

describe("value-objects/currency", () => {
  it("uppercases and validates 3-letter codes", () => {
    const r1 = newCurrencyCode("usd");
    const r2 = newCurrencyCode("JPY");
    expect(r1.isOk()).toBe(true);
    expect(r2.isOk()).toBe(true);
    if (r1.isOk()) expect(r1.value).toBe("USD");
    if (r2.isOk()) expect(isCurrencyCode(r2.value)).toBe(true);
  });

  it("rejects invalid codes", () => {
    const r = newCurrencyCode("USDT");
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error.name).toBe("DomainValidationError");
      expect(r.error.message).toContain("A-Z 3 letters");
    }
  });
});
