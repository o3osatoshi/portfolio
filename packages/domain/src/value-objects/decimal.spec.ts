import { describe, expect, it } from "vitest";

import {
  isDecimal,
  isNonNegativeDecimal,
  isPositiveDecimal,
  newDecimal,
} from "./decimal";

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

  it("isPositiveDecimal returns true only for values > 0", () => {
    const positive = newDecimal("0.1");
    const zero = newDecimal("0.0");
    const negative = newDecimal("-1");
    expect(positive.isOk()).toBe(true);
    expect(zero.isOk()).toBe(true);
    expect(negative.isOk()).toBe(true);
    if (!positive.isOk() || !zero.isOk() || !negative.isOk()) return;

    expect(isPositiveDecimal(positive.value)).toBe(true);
    expect(isPositiveDecimal(zero.value)).toBe(false);
    expect(isPositiveDecimal(negative.value)).toBe(false);
  });

  it("isNonNegativeDecimal returns true for zero or positive values only", () => {
    const zero = newDecimal("0");
    const positive = newDecimal("2");
    const negative = newDecimal("-1");
    expect(zero.isOk()).toBe(true);
    expect(positive.isOk()).toBe(true);
    expect(negative.isOk()).toBe(true);
    if (!zero.isOk() || !positive.isOk() || !negative.isOk()) return;

    expect(isNonNegativeDecimal(zero.value)).toBe(true);
    expect(isNonNegativeDecimal(positive.value)).toBe(true);
    expect(isNonNegativeDecimal(negative.value)).toBe(false);
  });
});
