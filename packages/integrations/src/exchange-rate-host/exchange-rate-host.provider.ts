import type {
  ExchangeRate,
  ExchangeRateProvider,
  ExchangeRateQuery,
} from "@repo/domain";
import { newExchangeRate } from "@repo/domain";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

import {
  type Kind,
  newError,
  newFetchError,
  truncate,
} from "@o3osatoshi/toolkit";

import {
  type ExchangeRateHostResponse,
  exchangeRateHostResponseSchema,
} from "./schema";

const DEFAULT_BASE_URL = "https://v6.exchangerate-api.com/v6";
const DEFAULT_ENDPOINT = "pair";

export type ExchangeRateHostConfig = {
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  fetch?: typeof fetch | undefined;
};

/**
 * ExchangeRate-API-backed implementation of {@link ExchangeRateProvider}.
 */
export class ExchangeRateHostProvider implements ExchangeRateProvider {
  constructor(private readonly config: ExchangeRateHostConfig = {}) {}

  /** @inheritdoc */
  getRate(query: ExchangeRateQuery) {
    const fetcher = this.config.fetch ?? fetch;
    const baseUrl = this.config.baseUrl ?? DEFAULT_BASE_URL;
    const path = this.config.apiKey
      ? `${this.config.apiKey}/${DEFAULT_ENDPOINT}/${query.base}/${query.target}`
      : `${DEFAULT_ENDPOINT}/${query.base}/${query.target}`;
    const url = new URL(path, normalizeBaseUrl(baseUrl));

    const request = { method: "GET", url: url.toString() };

    return ResultAsync.fromPromise(
      fetcher(url.toString(), {
        headers: {
          Accept: "application/json",
        },
      }),
      (cause) =>
        newFetchError({
          action: "FetchExchangeRateApi",
          cause,
          request,
        }),
    ).andThen((res) => handleExchangeRateResponse(res, query));
  }
}

function formatStatusReason(res: Response, body: string): string {
  const summary = body ? `: ${truncate(body)}` : "";
  return `ExchangeRate API responded with ${res.status} ${res.statusText}${summary}`;
}

function handleExchangeRateResponse(
  res: Response,
  query: ExchangeRateQuery,
): ResultAsync<ExchangeRate, Error> {
  if (!res.ok) {
    return ResultAsync.fromPromise(res.text(), (cause) =>
      newError({
        action: "ReadExchangeRateApiError",
        cause,
        kind: "BadGateway",
        layer: "External",
        reason: `Failed to read ExchangeRate API response (${res.status})`,
      }),
    ).andThen((body) =>
      errAsync(
        newError({
          action: "FetchExchangeRateApi",
          cause: body || undefined,
          kind: statusToKind(res.status),
          layer: "External",
          reason: formatStatusReason(res, body),
        }),
      ),
    );
  }

  return ResultAsync.fromPromise(res.json(), (cause) =>
    newError({
      action: "ParseExchangeRateApiResponse",
      cause,
      kind: "BadGateway",
      layer: "External",
      reason: "Failed to parse ExchangeRate API JSON response.",
    }),
  ).andThen((payload) => {
    const parsed = exchangeRateHostResponseSchema.safeParse(payload);
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
      rate,
      target: query.target,
    });
    if (normalized.isErr()) {
      return errAsync(normalized.error);
    }
    return okAsync(normalized.value);
  });
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
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
