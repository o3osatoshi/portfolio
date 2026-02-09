import type { FxQuoteProvider } from "@repo/domain";
import { newCurrencyCode } from "@repo/domain";
import { Result, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { toApplicationError } from "../../application-error";
import { applicationErrorCodes } from "../../application-error-catalog";
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
  execute(req: GetFxQuoteRequest): ResultAsync<GetFxQuoteResponse, RichError> {
    return Result.combine([
      newCurrencyCode(req.base),
      newCurrencyCode(req.quote),
    ])
      .asyncAndThen(([base, quote]) =>
        this.provider.getRate({ base, quote }).map(toFxQuoteResponse),
      )
      .mapErr((cause) =>
        toApplicationError({
          action: "GetFxQuote",
          cause,
          code: applicationErrorCodes.GET_FX_QUOTE_FAILED,
        }),
      );
  }
}
