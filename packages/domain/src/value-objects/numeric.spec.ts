import { describe, expect, it } from "vitest";
import {
  isAmount,
  isFee,
  isPrice,
  isProfitLoss,
  newAmount,
  newFee,
  newPrice,
  newProfitLoss,
} from "./numeric";

describe("value-objects/numeric", () => {
  it("Amount and Price must be > 0", () => {
    const amountOk = newAmount("1");
    const priceOk = newPrice(2);
    const amountBad = newAmount("0");
    const priceBad = newPrice("-1");
    expect(amountOk.isOk()).toBe(true);
    expect(priceOk.isOk()).toBe(true);
    expect(amountBad.isErr()).toBe(true);
    expect(priceBad.isErr()).toBe(true);
    if (amountOk.isOk()) expect(isAmount(amountOk.value)).toBe(true);
    if (priceOk.isOk()) expect(isPrice(priceOk.value)).toBe(true);
    if (amountBad.isErr())
      expect(amountBad.error.name).toBe("DomainValidationError");
    if (priceBad.isErr())
      expect(priceBad.error.name).toBe("DomainValidationError");
  });

  it("Fee must be >= 0", () => {
    const feeOk = newFee("0");
    const feeBad = newFee("-0.01");
    expect(feeOk.isOk()).toBe(true);
    expect(feeBad.isErr()).toBe(true);
    if (feeOk.isOk()) expect(isFee(feeOk.value)).toBe(true);
    if (feeBad.isErr()) expect(feeBad.error.name).toBe("DomainValidationError");
  });

  it("ProfitLoss can be negative, zero, or positive", () => {
    const neg = newProfitLoss("-10.5");
    const zero = newProfitLoss("0");
    const pos = newProfitLoss("3.14");
    expect(neg.isOk()).toBe(true);
    expect(zero.isOk()).toBe(true);
    expect(pos.isOk()).toBe(true);
    if (neg.isOk()) expect(isProfitLoss(neg.value)).toBe(true);
    if (zero.isOk()) expect(isProfitLoss(zero.value)).toBe(true);
    if (pos.isOk()) expect(isProfitLoss(pos.value)).toBe(true);
  });
});
