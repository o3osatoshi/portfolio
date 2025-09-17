import { describe, expect, it } from "vitest";

import { isDecimal, newDecimal } from "./decimal";

describe("value-objects/decimal", () => {
  it("newDecimal parses valid inputs and returns normalized string", () => {
    const r1 = newDecimal("123.4500");
    const r2 = newDecimal(0.5);
    expect(r1.isOk()).toBe(true);
    expect(r2.isOk()).toBe(true);
    if (r1.isOk()) expect(isDecimal(r1.value)).toBe(true);
    if (r2.isOk()) expect(isDecimal(r2.value)).toBe(true);
  });

  it("newDecimal rejects non-finite and invalid inputs", () => {
    const invalid = newDecimal("abc");
    const nonFinite = newDecimal(Number.POSITIVE_INFINITY);
    expect(invalid.isErr()).toBe(true);
    expect(nonFinite.isErr()).toBe(true);
    if (invalid.isErr()) {
      expect(invalid.error.name).toBe("DomainValidationError");
      expect(invalid.error.message).toContain("Invalid decimal input");
    }
    if (nonFinite.isErr()) {
      expect(nonFinite.error.name).toBe("DomainValidationError");
      expect(nonFinite.error.message).toContain("finite");
    }
  });
});
