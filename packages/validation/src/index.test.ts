import { describe, expect, it } from "vitest";
import {
  validateCreateTransaction,
  validateDeleteTransaction,
  validateTransactions,
  validateUpdateTransaction,
} from "./index";

describe("validateTransactions", () => {
  it("parses valid transactions array", () => {
    const validTransactions = [
      {
        id: "1",
        type: "buy",
        datetime: "2023-01-01T00:00:00Z",
        amount: "100",
        price: "50000",
        currency: "BTC",
        userId: "user1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    ];

    const result = validateTransactions(validTransactions);
    expect(result[0].id).toBe("1");
    expect(result[0].type).toBe("buy");
  });
});

describe("validateCreateTransaction", () => {
  it("parses valid create transaction data", () => {
    const validData = {
      type: "buy",
      datetime: "2023-01-01T00:00:00Z",
      amount: 100,
      price: 50000,
      currency: "BTC",
    };

    const result = validateCreateTransaction(validData);
    expect(result.type).toBe("buy");
    expect(result.amount).toBe("100");
  });
});

describe("validateUpdateTransaction", () => {
  it("parses valid update transaction data", () => {
    const validData = {
      id: "1",
      type: "sell",
      amount: 50,
    };

    const result = validateUpdateTransaction(validData);
    expect(result.id).toBe("1");
    expect(result.type).toBe("sell");
    expect(result.amount).toBe("50");
  });
});

describe("validateDeleteTransaction", () => {
  it("parses valid delete transaction data", () => {
    const validData = { id: "1" };

    const result = validateDeleteTransaction(validData);
    expect(result.id).toBe("1");
  });
});
