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
  newAmount,
  newCurrencyCode,
  newDateTime,
  newFee,
  newPrice,
  newProfitLoss,
  newTransactionId,
  newTransactionType,
  newUserId,
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
      type: expectOk(newTransactionType(merged.type)),
      datetime: expectOk(newDateTime(merged.datetime)),
      amount: expectOk(newAmount(merged.amount)),
      price: expectOk(newPrice(merged.price)),
      currency: expectOk(newCurrencyCode(merged.currency)),
      profitLoss: merged.profitLoss
        ? expectOk(newProfitLoss(merged.profitLoss))
        : undefined,
      fee: merged.fee ? expectOk(newFee(merged.fee)) : undefined,
      feeCurrency: merged.feeCurrency
        ? expectOk(newCurrencyCode(merged.feeCurrency))
        : undefined,
      userId: expectOk(newUserId(merged.userId)),
    };
  }

  /**
   * 値オブジェクトを直接作成
   */
  static newTransactionId(id: string): TransactionId {
    return expectOk(newTransactionId(id));
  }

  static newUserId(id: string): UserId {
    return expectOk(newUserId(id));
  }

  static newTransactionType(type: "BUY" | "SELL"): TransactionType {
    return expectOk(newTransactionType(type));
  }

  static newDateTime(date: Date): DateTime {
    return expectOk(newDateTime(date));
  }

  static newAmount(amount: string): Amount {
    return expectOk(newAmount(amount));
  }

  static newPrice(price: string): Price {
    return expectOk(newPrice(price));
  }

  static newCurrencyCode(currency: string): CurrencyCode {
    return expectOk(newCurrencyCode(currency));
  }

  static newFee(fee: string): Fee {
    return expectOk(newFee(fee));
  }

  static newProfitLoss(profitLoss: string): ProfitLoss {
    return expectOk(newProfitLoss(profitLoss));
  }
}
