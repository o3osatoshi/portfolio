import {
  type Amount,
  type CreateTransaction,
  type CurrencyCode,
  type DateTime,
  type Fee,
  type Price,
  type ProfitLoss,
  type TransactionId,
  type TransactionType,
  type UserId,
  makeAmount,
  makeCurrencyCode,
  makeDateTime,
  makeFee,
  makePrice,
  makeProfitLoss,
  makeTransactionId,
  makeTransactionType,
  makeUserId,
} from "@repo/domain";
import type { Result } from "neverthrow";

export function expectOk<T, E>(result: Result<T, E>): T {
  if (result.isErr()) {
    throw new Error(`Expected Ok but got Err: ${result.error}`);
  }
  return result.value;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TestHelpers {
  /**
   * CreateTransactionを値オブジェクト形式で作成
   */
  static createValidTransaction(
    overrides: Partial<{
      type: "BUY" | "SELL";
      datetime: Date;
      amount: string;
      price: string;
      currency: string;
      userId: string;
      profitLoss?: string;
      fee?: string;
      feeCurrency?: string;
    }> = {},
  ): CreateTransaction {
    const defaults = {
      type: "BUY" as const,
      datetime: new Date(),
      amount: "1.0",
      price: "100.0",
      currency: "USD",
      userId: "test-user-1",
    };

    const merged = { ...defaults, ...overrides };

    return {
      type: expectOk(makeTransactionType(merged.type)),
      datetime: expectOk(makeDateTime(merged.datetime)),
      amount: expectOk(makeAmount(merged.amount)),
      price: expectOk(makePrice(merged.price)),
      currency: expectOk(makeCurrencyCode(merged.currency)),
      profitLoss: merged.profitLoss
        ? expectOk(makeProfitLoss(merged.profitLoss))
        : undefined,
      fee: merged.fee ? expectOk(makeFee(merged.fee)) : undefined,
      feeCurrency: merged.feeCurrency
        ? expectOk(makeCurrencyCode(merged.feeCurrency))
        : undefined,
      userId: expectOk(makeUserId(merged.userId)),
    };
  }

  /**
   * 値オブジェクトを直接作成
   */
  static makeTransactionId(id: string): TransactionId {
    return expectOk(makeTransactionId(id));
  }

  static makeUserId(id: string): UserId {
    return expectOk(makeUserId(id));
  }

  static makeTransactionType(type: "BUY" | "SELL"): TransactionType {
    return expectOk(makeTransactionType(type));
  }

  static makeDateTime(date: Date): DateTime {
    return expectOk(makeDateTime(date));
  }

  static makeAmount(amount: string): Amount {
    return expectOk(makeAmount(amount));
  }

  static makePrice(price: string): Price {
    return expectOk(makePrice(price));
  }

  static makeCurrencyCode(currency: string): CurrencyCode {
    return expectOk(makeCurrencyCode(currency));
  }

  static makeFee(fee: string): Fee {
    return expectOk(makeFee(fee));
  }

  static makeProfitLoss(profitLoss: string): ProfitLoss {
    return expectOk(makeProfitLoss(profitLoss));
  }
}
