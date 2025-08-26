import { describe, expect, it } from "vitest";
import { isTransactionType, newTransactionType } from "./transaction-type";

describe("value-objects/transaction-type", () => {
  it("accepts BUY and SELL only", () => {
    const buy = newTransactionType("BUY");
    const sell = newTransactionType("SELL");
    const bad = newTransactionType("HOLD");
    expect(buy.isOk()).toBe(true);
    expect(sell.isOk()).toBe(true);
    expect(bad.isErr()).toBe(true);
    if (buy.isOk()) expect(isTransactionType(buy.value)).toBe(true);
    if (bad.isErr()) expect(bad.error.name).toBe("DomainValidationError");
  });
});
