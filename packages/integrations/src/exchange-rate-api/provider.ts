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
import { type ExchangeRateApiPair, exchangeRateApiPairSchema } from "./schema";

const CACHE_TTL_MS = 3_600_000;
const CACHE_KEY_PREFIX = "fx:rate";

export type ExchangeRateApiConfig = {
  apiKey: string;
  baseUrl: string;
} & ApiSmartFetchClientOptions;

type ExchangeRatePayload = ExchangeRateApiPair | undefined;

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
          getKey:
            config.cache.getKey ??
            ((request) => buildCacheKeyFromUrl(request.url)),
          ttlMs: config.cache.ttlMs ?? CACHE_TTL_MS,
        }
      : undefined;

    const logging = config.logging
      ? {
          ...config.logging,
          redactUrl:
            config.logging.redactUrl ??
            createUrlRedactor({ secrets: [config.apiKey] }),
          requestName: config.logging.requestName ?? "exchange_rate",
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
            shouldCache: (res: SmartFetchResponse<ExchangeRatePayload>) =>
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
      schema: exchangeRateApiPairSchema,
      url: url.toString(),
    };

    return this.client(request).andThen((res) =>
      handleExchangeRateResponse(res, query),
    );
  }
}

function buildCacheKeyFromUrl(url: string): string | undefined {
  return Result.fromThrowable(
    () => new URL(url),
    () => undefined,
  )()
    .andThen((parsed) => {
      const segments = parsed.pathname.split("/").filter(Boolean);
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

function handleExchangeRateResponse(
  result: SmartFetchResponse<ExchangeRatePayload>,
  query: FxQuoteQuery,
): ResultAsync<FxQuote, Error> {
  // Check HTTP response status
  const httpResult =
    result.response?.ok === false
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

  return (
    ResultAsync.fromSafePromise(Promise.resolve())
      .andThen(() => httpResult)
      // Check API result status
      .andThen((data) => {
        if (data?.result && data.result !== "success") {
          const detail = data["error-type"] ?? "Unknown error";
          return err(
            newIntegrationError({
              action: "FetchExchangeRateApi",
              cause: data,
              kind: "BadGateway",
              reason: `ExchangeRate API error: ${detail}`,
            }),
          );
        }
        return ok(data);
      })
      // Extract conversion rate
      .andThen((data) => {
        if (data?.conversion_rate === undefined) {
          return err(
            newIntegrationError({
              action: "ParseExchangeRateApiResponse",
              kind: "BadGateway",
              reason: "ExchangeRate API response missing conversion rate.",
            }),
          );
        }
        return ok({ data, rate: data.conversion_rate });
      })
      // Create FxQuote
      .andThen(({ data, rate }) => {
        const asOf = resolveAsOf(data);
        return newFxQuote({
          asOf,
          base: query.base,
          quote: query.quote,
          rate,
        });
      })
  );
}

function isCacheablePayload(payload: ExchangeRatePayload): boolean {
  if (!payload) {
    return false;
  }
  if (payload.result && payload.result !== "success") {
    return false;
  }
  return payload.conversion_rate !== undefined;
}

function resolveAsOf(payload: ExchangeRateApiPair): Date {
  if (typeof payload.time_last_update_unix === "number") {
    return new Date(payload.time_last_update_unix * 1000);
  }
  if (payload.time_last_update_utc) {
    const parsed = new Date(payload.time_last_update_utc);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}
