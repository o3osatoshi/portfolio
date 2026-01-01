import type { FxQuote, FxQuoteProvider, FxQuoteQuery } from "@repo/domain";
import { newFxQuote } from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { type Kind, newError, truncate } from "@o3osatoshi/toolkit";

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
          redactUrl: config.logging.redactUrl ?? buildRedactUrl(config.apiKey),
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

function buildRedactUrl(apiKey?: string) {
  if (!apiKey) {
    return (url: string) => url;
  }

  return (url: string) => {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split("/").map((segment) => {
        if (!segment) return segment;
        return segment === apiKey ? "<redacted>" : segment;
      });
      parsed.pathname = segments.join("/");
      return parsed.toString();
    } catch {
      return url.replace(apiKey, "<redacted>");
    }
  };
}

function formatPayload(payload: unknown): string {
  if (payload === null) return "null";
  if (payload === undefined) return "";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

function formatStatusReason(
  res: { status: number; statusText: string },
  payload: unknown,
): string {
  const formatted = formatPayload(payload);
  const summary = formatted ? `: ${truncate(formatted)}` : "";
  return `ExchangeRate API responded with ${res.status} ${res.statusText}${summary}`;
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
        kind: statusToKind(result.response.status),
        layer: "External",
        reason: formatStatusReason(result.response, result.data),
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

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
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

function statusToKind(status: number): Kind {
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "NotFound";
  if (status === 408) return "Timeout";
  if (status === 429) return "RateLimit";
  if (status >= 400 && status < 500) return "BadRequest";
  if (status >= 500 && status < 600) return "BadGateway";
  return "Unknown";
}
