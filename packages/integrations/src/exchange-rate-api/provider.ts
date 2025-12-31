import type {
  CacheStore,
  ExchangeRate,
  ExchangeRateProvider,
  ExchangeRateQuery,
} from "@repo/domain";
import { newExchangeRate } from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import type { Logger } from "@o3osatoshi/logging";
import { type Kind, newError, truncate } from "@o3osatoshi/toolkit";

import {
  createServerFetchClient,
  type RetryOptions,
  type ServerFetchResponse,
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
  cacheStore?: CacheStore | undefined;
  cacheTtlMs?: number | undefined;
  fetch?: typeof fetch | undefined;
  logger?: Logger | undefined;
  retry?: RetryOptions | undefined;
};

type ExchangeRatePayload = ExchangeRateHostResponse | undefined;

/**
 * ExchangeRate-API-backed implementation of {@link ExchangeRateProvider}.
 */
export class ExchangeRateApi implements ExchangeRateProvider {
  constructor(private readonly config: ExchangeRateApiConfig) {}

  /** @inheritdoc */
  getRate(query: ExchangeRateQuery) {
    const path = `${this.config.apiKey}/pair/${query.base}/${query.quote}`;
    const url = new URL(path, normalizeBaseUrl(this.config.baseUrl));

    const request = {
      headers: {
        Accept: "application/json",
      },
      parse: parseExchangeRatePayload,
      url: url.toString(),
    };

    const client = createServerFetchClient<ExchangeRatePayload>({
      cache: {
        getKey: () => `${CACHE_KEY_PREFIX}:${query.base}:${query.quote}`,
        shouldCache: (res) => isCacheablePayload(res.data),
        store: this.config.cacheStore,
        ttlMs: this.config.cacheTtlMs ?? CACHE_TTL_MS,
      },
      fetch: this.config.fetch,
      observability: {
        logger: this.config.logger,
        redactUrl: buildRedactUrl(this.config.apiKey),
        requestName: "exchange_rate",
      },
      retry: this.config.retry,
    });

    return client(request).andThen((res) =>
      handleExchangeRateResponse(res, query),
    );
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
  result: ServerFetchResponse<ExchangeRatePayload>,
  query: ExchangeRateQuery,
): ResultAsync<ExchangeRate, Error> {
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
  const normalized = newExchangeRate({
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
