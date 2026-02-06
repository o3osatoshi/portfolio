import type { FxQuote, FxQuoteProvider, FxQuoteQuery } from "@repo/domain";
import { newFxQuote } from "@repo/domain";
import type { Result } from "neverthrow";
import { err } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";
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
  private readonly sFetch: SmartFetch;

  constructor(
    config: ExchangeRateApiConfig,
    options: ExchangeRateApiOptions = {},
  ) {
    this.apiKey = config.apiKey;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.sFetch = createSmartFetch(options);
  }

  /** @inheritdoc */
  getRate(query: FxQuoteQuery) {
    const path = `${this.apiKey}/pair/${query.base}/${query.quote}`;
    const url = new URL(path, this.baseUrl);

    return this.sFetch<typeof exchangeRateApiPairSchema>({
      cache: {
        getKey: (req) => buildCacheKey(req.url),
        shouldCache: (res) => isCacheable(res.data),
        ttlMs: CACHE_TTL_MS,
      },
      decode: {
        context: {
          action: "ParseExchangeRateApiResponse",
          layer: "External",
        },
        schema: exchangeRateApiPairSchema,
      },
      headers: {
        Accept: "application/json",
      },
      logging: {
        redactUrl: createUrlRedactor({ secrets: [this.apiKey] }),
        requestName: "ExchangeRateApiPairRequest",
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
): Result<FxQuote, RichError> {
  if (!res.response.ok) {
    return err(
      newIntegrationError({
        cause: res.data,
        details: {
          action: "FetchExchangeRateApi",
          reason: formatHttpStatusReason({
            payload: res.data,
            response: res.response,
            serviceName: "ExchangeRate API",
          }),
        },
        kind: httpStatusToKind(res.response.status),
      }),
    );
  }

  const pair = res.data;

  if (pair?.result && pair.result !== "success") {
    const detail = pair["error-type"] ?? "Unknown error";
    return err(
      newIntegrationError({
        cause: pair,
        details: {
          action: "FetchExchangeRateApi",
          reason: `ExchangeRate API error: ${detail}`,
        },
        kind: "BadGateway",
      }),
    );
  }

  if (pair?.conversion_rate === undefined) {
    return err(
      newIntegrationError({
        details: {
          action: "ParseExchangeRateApiResponse",
          reason: "ExchangeRate API response missing conversion rate.",
        },
        kind: "BadGateway",
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
