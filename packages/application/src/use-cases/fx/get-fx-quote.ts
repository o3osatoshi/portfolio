import type { FxQuoteProvider } from "@repo/domain";
import { newCurrencyCode } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

import type { GetFxQuoteRequest, GetFxQuoteResponse } from "../../dtos";
import { toFxQuoteResponse } from "../../dtos";

/**
 * Use case that fetches the latest FX quote for a currency pair.
 */
export class GetFxQuoteUseCase {
  constructor(private readonly provider: FxQuoteProvider) {}

  /**
   * Validate currency codes and load the latest FX quote.
   *
   * @param req - Normalized request payload.
   * @returns ResultAsync with a typed response or a structured error.
   */
  execute(req: GetFxQuoteRequest): ResultAsync<GetFxQuoteResponse, Error> {
    const base = newCurrencyCode(req.base);
    if (base.isErr()) return errAsync(base.error);
    const quote = newCurrencyCode(req.quote);
    if (quote.isErr()) return errAsync(quote.error);

    return this.provider
      .getRate({
        base: base.value,
        quote: quote.value,
      })
      .map(toFxQuoteResponse);
  }
}
