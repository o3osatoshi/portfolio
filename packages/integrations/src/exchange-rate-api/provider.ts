import type { FxQuote, FxQuoteProvider, FxQuoteQuery } from "@repo/domain";
import { newFxQuote } from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import {
  createUrlRedactor,
  formatHttpStatusReason,
  httpStatusToKind,
  newError,
  normalizeBaseUrl,
} from "@o3osatoshi/toolkit";

import {
  type ApiBetterFetchClientOptions,
  type BetterFetchClient,
  type BetterFetchResponse,
  createBetterFetchClient,
} from "../http";
import {
  type ExchangeRateHostResponse,
  exchangeRateHostResponseSchema,
} from "./schema";

const CACHE_TTL_MS = 3_600_000;
const CACHE_KEY_PREFIX = "fx:rate";

export type ExchangeRateApiConfig = {
  apiKey: string;
  baseUrl: string;
} & ApiBetterFetchClientOptions<ExchangeRatePayload>;

type ExchangeRatePayload = ExchangeRateHostResponse | undefined;

/**
 * ExchangeRate-API-backed implementation of {@link FxQuoteProvider}.
 */
export class ExchangeRateApi implements FxQuoteProvider {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly client: BetterFetchClient<ExchangeRatePayload>;

  constructor(config: ExchangeRateApiConfig) {
    this.apiKey = config.apiKey;
    this.apiBaseUrl = normalizeBaseUrl(config.baseUrl);

    const cache = config.cache
      ? {
          ...config.cache,
          getKey:
            config.cache.getKey ??
            ((request) => buildCacheKeyFromUrl(request.url)),
          shouldCache:
            config.cache.shouldCache ?? ((res) => isCacheablePayload(res.data)),
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
    this.client = createBetterFetchClient<ExchangeRatePayload>({
      cache,
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
      headers: {
        Accept: "application/json",
      },
      parse: parseExchangeRatePayload,
      url: url.toString(),
    };

    return this.client(request).andThen((res) =>
      handleExchangeRateResponse(res, query),
    );
  }
}

function buildCacheKeyFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const pairIndex = segments.indexOf("pair");
    if (pairIndex < 0 || segments.length <= pairIndex + 2) return undefined;
    const base = segments[pairIndex + 1]?.toUpperCase();
    const quote = segments[pairIndex + 2]?.toUpperCase();
    if (!base || !quote) return undefined;
    return `${CACHE_KEY_PREFIX}:${base}:${quote}`;
  } catch {
    return undefined;
  }
}

function handleExchangeRateResponse(
  result: BetterFetchResponse<ExchangeRatePayload>,
  query: FxQuoteQuery,
): ResultAsync<FxQuote, Error> {
  if (result.response && !result.response.ok) {
    return errAsync(
      newError({
        action: "FetchExchangeRateApi",
        cause: result.data,
        kind: httpStatusToKind(result.response.status),
        layer: "External",
        reason: formatHttpStatusReason({
          payload: result.data,
          response: result.response,
          serviceName: "ExchangeRate API",
        }),
      }),
    );
  }

  const parsed = exchangeRateHostResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    return errAsync(
      newError({
        action: "ParseExchangeRateApiResponse",
        cause: parsed.error,
        kind: "BadGateway",
        layer: "External",
        reason: "ExchangeRate API payload did not match schema.",
      }),
    );
  }

  if (parsed.data.result && parsed.data.result !== "success") {
    const detail = parsed.data["error-type"] ?? "Unknown error";
    return errAsync(
      newError({
        action: "FetchExchangeRateApi",
        cause: parsed.data,
        kind: "BadGateway",
        layer: "External",
        reason: `ExchangeRate API error: ${detail}`,
      }),
    );
  }

  const rate = parsed.data.conversion_rate;
  if (rate === undefined) {
    return errAsync(
      newError({
        action: "ParseExchangeRateApiResponse",
        kind: "BadGateway",
        layer: "External",
        reason: "ExchangeRate API response missing conversion rate.",
      }),
    );
  }

  const asOf = resolveAsOf(parsed.data);
  const normalized = newFxQuote({
    asOf,
    base: query.base,
    quote: query.quote,
    rate,
  });
  if (normalized.isErr()) {
    return errAsync(normalized.error);
  }
  return okAsync(normalized.value);
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

async function parseExchangeRatePayload(
  res: Response,
): Promise<ExchangeRatePayload> {
  try {
    return (await res.json()) as ExchangeRateHostResponse;
  } catch (cause) {
    if (res.ok) {
      throw cause;
    }
    return undefined;
  }
}

function resolveAsOf(payload: ExchangeRateHostResponse): Date {
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
