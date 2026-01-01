import type { FxQuote, FxQuoteProvider, FxQuoteQuery } from "@repo/domain";
import { newFxQuote } from "@repo/domain";
import { err, ok, Result, ResultAsync } from "neverthrow";

import {
  createUrlRedactor,
  formatHttpStatusReason,
  httpStatusToKind,
  normalizeBaseUrl,
} from "@o3osatoshi/toolkit";

import {
  type ApiSmartFetchClientOptions,
  createSmartFetchClient,
  type SmartFetchCache,
  type SmartFetchClient,
  type SmartFetchResponse,
} from "../http";
import { newIntegrationError } from "../integration-error";
import {
  type ExchangeRatePairResponse,
  exchangeRatePairResponseSchema,
} from "./schema";

const CACHE_TTL_MS = 3_600_000;
const CACHE_KEY_PREFIX = "fx:rate";

export type ExchangeRateApiConfig = {
  apiKey: string;
  baseUrl: string;
} & ApiSmartFetchClientOptions;

/**
 * ExchangeRate-API-backed implementation of {@link FxQuoteProvider}.
 */
export class ExchangeRateApi implements FxQuoteProvider {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly cache: SmartFetchCache | undefined;
  private readonly client: SmartFetchClient;

  constructor(config: ExchangeRateApiConfig) {
    this.apiKey = config.apiKey;
    this.apiBaseUrl = normalizeBaseUrl(config.baseUrl);

    this.cache = config.cache
      ? {
          ...config.cache,
          getKey: (request) => buildCacheKey(request.url),
          ttlMs: CACHE_TTL_MS,
        }
      : undefined;

    const logging = config.logging
      ? {
          ...config.logging,
          redactUrl: createUrlRedactor({ secrets: [config.apiKey] }),
          requestName: "exchange_rate",
        }
      : undefined;

    this.client = createSmartFetchClient({
      cache: this.cache,
      fetch: config.fetch,
      logging,
      retry: config.retry,
    });
  }

  /** @inheritdoc */
  getRate(query: FxQuoteQuery) {
    const path = `${this.apiKey}/pair/${query.base}/${query.quote}`;
    const url = new URL(path, this.apiBaseUrl);

    const request = {
      cache: this.cache
        ? {
            shouldCache: (res: SmartFetchResponse<ExchangeRatePairResponse>) =>
              isCacheablePayload(res.data),
          }
        : undefined,
      headers: {
        Accept: "application/json",
      },
      parseContext: {
        action: "ParseExchangeRateApiResponse",
        layer: "External" as const,
      },
      schema: exchangeRatePairResponseSchema,
      url: url.toString(),
    };

    return this.client(request).andThen((res) => toFxQuote(res, query));
  }
}

function buildCacheKey(url: string): string | undefined {
  return Result.fromThrowable(
    () => new URL(url),
    () => undefined,
  )()
    .andThen((parsedUrl) => {
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const pairIndex = segments.indexOf("pair");

      if (pairIndex < 0 || segments.length <= pairIndex + 2) {
        return err(undefined);
      }

      const base = segments[pairIndex + 1]?.toUpperCase();
      const quote = segments[pairIndex + 2]?.toUpperCase();

      if (!base || !quote) {
        return err(undefined);
      }

      return ok(`${CACHE_KEY_PREFIX}:${base}:${quote}`);
    })
    .unwrapOr(undefined);
}

function isCacheablePayload(res: ExchangeRatePairResponse): boolean {
  if (!res) {
    return false;
  }
  if (res.result && res.result !== "success") {
    return false;
  }
  return res.conversion_rate !== undefined;
}

function resolveAsOf(res: ExchangeRatePairResponse): Date {
  if (typeof res.time_last_update_unix === "number") {
    return new Date(res.time_last_update_unix * 1000);
  }
  if (res.time_last_update_utc) {
    const lastDate = new Date(res.time_last_update_utc);
    if (!Number.isNaN(lastDate.getTime())) {
      return lastDate;
    }
  }
  return new Date();
}

function toFxQuote(
  result: SmartFetchResponse<ExchangeRatePairResponse>,
  query: FxQuoteQuery,
): ResultAsync<FxQuote, Error> {
  return ResultAsync.fromSafePromise(Promise.resolve())
    .andThen(() => {
      return result.response?.ok === false
        ? err(
            newIntegrationError({
              action: "FetchExchangeRateApi",
              cause: result.data,
              kind: httpStatusToKind(result.response.status),
              reason: formatHttpStatusReason({
                payload: result.data,
                response: result.response,
                serviceName: "ExchangeRate API",
              }),
            }),
          )
        : ok(result.data);
    })
    .andThen((res) => {
      if (res?.result && res.result !== "success") {
        const detail = res["error-type"] ?? "Unknown error";
        return err(
          newIntegrationError({
            action: "FetchExchangeRateApi",
            cause: res,
            kind: "BadGateway",
            reason: `ExchangeRate API error: ${detail}`,
          }),
        );
      }
      return ok(res);
    })
    .andThen((res) => {
      if (res?.conversion_rate === undefined) {
        return err(
          newIntegrationError({
            action: "ParseExchangeRateApiResponse",
            kind: "BadGateway",
            reason: "ExchangeRate API response missing conversion rate.",
          }),
        );
      }
      return ok({ rate: res.conversion_rate, res });
    })
    .andThen(({ rate, res }) => {
      const asOf = resolveAsOf(res);
      return newFxQuote({
        asOf,
        base: query.base,
        quote: query.quote,
        rate,
      });
    });
}
