import type { FxQuote, FxQuoteProvider, FxQuoteQuery } from "@repo/domain";
import { newFxQuote } from "@repo/domain";
import type { Result } from "neverthrow";
import { err } from "neverthrow";

import {
  createUrlRedactor,
  formatHttpStatusReason,
  httpStatusToKind,
  normalizeBaseUrl,
} from "@o3osatoshi/toolkit";

import {
  createSmartFetch,
  type CreateSmartFetchOptions,
  type SmartFetch,
  type SmartFetchCacheOptions,
  type SmartFetchResponse,
} from "../http";
import { newIntegrationError } from "../integration-error";
import { type ExchangeRateApiPair, exchangeRateApiPairSchema } from "./schema";

const CACHE_TTL_MS = 3_600_000;
const CACHE_KEY_PREFIX = "fx:rate";

export type ExchangeRateApiConfig = {
  apiKey: string;
  baseUrl: string;
};

export type ExchangeRateApiOptions = CreateSmartFetchOptions;

/**
 * ExchangeRate-API-backed implementation of {@link FxQuoteProvider}.
 */
export class ExchangeRateApi implements FxQuoteProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cache: SmartFetchCacheOptions | undefined;
  private readonly sFetch: SmartFetch;

  constructor(
    config: ExchangeRateApiConfig,
    options: ExchangeRateApiOptions = {},
  ) {
    this.apiKey = config.apiKey;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);

    this.cache = options.cache
      ? {
          ttlMs: CACHE_TTL_MS,
          ...options.cache,
        }
      : undefined;

    const logging = options.logging
      ? {
          ...options.logging,
          redactUrl: createUrlRedactor({ secrets: [config.apiKey] }),
          requestName: "exchange_rate",
        }
      : undefined;

    this.sFetch = createSmartFetch({
      cache: this.cache,
      fetch: options.fetch,
      logging,
      retry: options.retry,
    });
  }

  /** @inheritdoc */
  getRate(query: FxQuoteQuery) {
    const path = `${this.apiKey}/pair/${query.base}/${query.quote}`;
    const url = new URL(path, this.baseUrl);

    return this.sFetch<typeof exchangeRateApiPairSchema>({
      cache: this.cache
        ? {
            getKey: (req) => buildCacheKey(req.url),
            shouldCache: (res) => isCacheable(res.data),
          }
        : undefined,
      decode: {
        context: {
          action: "ParseExchangeRateApiResponse",
          layer: "External" as const,
        },
        schema: exchangeRateApiPairSchema,
      },
      headers: {
        Accept: "application/json",
      },
      url: url.toString(),
    }).andThen((res) => toFxQuote(res, query));
  }
}

function buildCacheKey(url: string): string | undefined {
  const _url = new URL(url);
  const segments = _url.pathname.split("/").filter(Boolean);
  const pairIndex = segments.indexOf("pair");

  if (pairIndex < 0 || segments.length <= pairIndex + 2) {
    return undefined;
  }

  const base = segments[pairIndex + 1]?.toUpperCase();
  const quote = segments[pairIndex + 2]?.toUpperCase();

  if (!base || !quote) {
    return undefined;
  }

  return `${CACHE_KEY_PREFIX}:${base}:${quote}`;
}

function isCacheable(pair: ExchangeRateApiPair): boolean {
  if (!pair) {
    return false;
  }
  if (pair.result && pair.result !== "success") {
    return false;
  }
  return pair.conversion_rate !== undefined;
}

function resolveAsOf(pair: ExchangeRateApiPair): Date {
  if (typeof pair.time_last_update_unix === "number") {
    return new Date(pair.time_last_update_unix * 1000);
  }
  if (pair.time_last_update_utc) {
    const asOf = new Date(pair.time_last_update_utc);
    if (!Number.isNaN(asOf.getTime())) {
      return asOf;
    }
  }
  return new Date();
}

function toFxQuote(
  res: SmartFetchResponse<ExchangeRateApiPair>,
  query: FxQuoteQuery,
): Result<FxQuote, Error> {
  if (!res.response.ok) {
    return err(
      newIntegrationError({
        action: "FetchExchangeRateApi",
        cause: res.data,
        kind: httpStatusToKind(res.response.status),
        reason: formatHttpStatusReason({
          payload: res.data,
          response: res.response,
          serviceName: "ExchangeRate API",
        }),
      }),
    );
  }

  const pair = res.data;

  if (pair?.result && pair.result !== "success") {
    const detail = pair["error-type"] ?? "Unknown error";
    return err(
      newIntegrationError({
        action: "FetchExchangeRateApi",
        cause: pair,
        kind: "BadGateway",
        reason: `ExchangeRate API error: ${detail}`,
      }),
    );
  }

  if (pair?.conversion_rate === undefined) {
    return err(
      newIntegrationError({
        action: "ParseExchangeRateApiResponse",
        kind: "BadGateway",
        reason: "ExchangeRate API response missing conversion rate.",
      }),
    );
  }

  return newFxQuote({
    asOf: resolveAsOf(pair),
    base: query.base,
    quote: query.quote,
    rate: pair.conversion_rate,
  });
}
