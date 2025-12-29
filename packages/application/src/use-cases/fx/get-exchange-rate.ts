import type { ExchangeRateProvider } from "@repo/domain";
import { newCurrencyCode } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

import type {
  GetExchangeRateRequest,
  GetExchangeRateResponse,
} from "../../dtos";
import { toExchangeRateResponse } from "../../dtos";

/**
 * Use case that fetches the latest exchange rate for a currency pair.
 */
export class GetExchangeRateUseCase {
  constructor(private readonly provider: ExchangeRateProvider) {}

  /**
   * Validate currency codes and load the latest exchange rate.
   *
   * @param req - Normalized request payload.
   * @returns ResultAsync with a typed response or a structured error.
   */
  execute(
    req: GetExchangeRateRequest,
  ): ResultAsync<GetExchangeRateResponse, Error> {
    const base = newCurrencyCode(req.base);
    if (base.isErr()) return errAsync(base.error);
    const target = newCurrencyCode(req.target);
    if (target.isErr()) return errAsync(target.error);

    return this.provider
      .getRate({
        base: base.value,
        target: target.value,
      })
      .map(toExchangeRateResponse);
  }
}
