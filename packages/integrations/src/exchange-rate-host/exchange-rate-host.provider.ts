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

import { exchangeRateHostResponseSchema } from "./schema";

const DEFAULT_BASE_URL = "https://api.exchangerate.host";
const DEFAULT_API_KEY_PARAM = "access_key";
const DEFAULT_ENDPOINT = "latest";

export type ExchangeRateHostConfig = {
  apiKey?: string | undefined;
  apiKeyParam?: string | undefined;
  baseUrl?: string | undefined;
  fetch?: typeof fetch | undefined;
};

/**
 * ExchangeRate.host-backed implementation of {@link ExchangeRateProvider}.
 */
export class ExchangeRateHostProvider implements ExchangeRateProvider {
  constructor(private readonly config: ExchangeRateHostConfig = {}) {}

  /** @inheritdoc */
  getRate(query: ExchangeRateQuery) {
    const fetcher = this.config.fetch ?? fetch;
    const baseUrl = this.config.baseUrl ?? DEFAULT_BASE_URL;
    const apiKeyParam = this.config.apiKeyParam ?? DEFAULT_API_KEY_PARAM;

    const url = new URL(
      DEFAULT_ENDPOINT,
      normalizeBaseUrl(baseUrl),
    );
    url.searchParams.set("base", query.base);
    url.searchParams.set("symbols", query.target);
    if (this.config.apiKey) {
      url.searchParams.set(apiKeyParam, this.config.apiKey);
    }

    const request = { method: "GET", url: url.toString() };

    return ResultAsync.fromPromise(
      fetcher(url.toString(), {
        headers: {
          Accept: "application/json",
        },
      }),
      (cause) =>
        newFetchError({
          action: "FetchExchangeRateHost",
          cause,
          request,
        }),
    ).andThen((res) => handleExchangeRateResponse(res, query));
  }
}

function handleExchangeRateResponse(
  res: Response,
  query: ExchangeRateQuery,
): ResultAsync<ExchangeRate, Error> {
  if (!res.ok) {
    return ResultAsync.fromPromise(
      res.text(),
      (cause) =>
        newError({
          action: "ReadExchangeRateHostError",
          cause,
          kind: "BadGateway",
          layer: "External",
          reason: `Failed to read ExchangeRate.host response (${res.status})`,
        }),
    ).andThen((body) =>
      errAsync(
        newError({
          action: "FetchExchangeRateHost",
          cause: body || undefined,
          kind: statusToKind(res.status),
          layer: "External",
          reason: formatStatusReason(res, body),
        }),
      ),
    );
  }

  return ResultAsync.fromPromise(
    res.json(),
    (cause) =>
      newError({
        action: "ParseExchangeRateHostResponse",
        cause,
        kind: "BadGateway",
        layer: "External",
        reason: "Failed to parse ExchangeRate.host JSON response.",
      }),
  ).andThen((payload) => {
    const parsed = exchangeRateHostResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return errAsync(
        newError({
          action: "ParseExchangeRateHostResponse",
          cause: parsed.error,
          kind: "BadGateway",
          layer: "External",
          reason: "ExchangeRate.host payload did not match schema.",
        }),
      );
    }

    if (parsed.data.success === false) {
      const detail =
        parsed.data.error?.info ??
        parsed.data.error?.type ??
        "Unknown error";
      return errAsync(
        newError({
          action: "FetchExchangeRateHost",
          cause: parsed.data.error,
          kind: "BadGateway",
          layer: "External",
          reason: `ExchangeRate.host error: ${detail}`,
        }),
      );
    }

    const rate = parsed.data.rates[query.target];
    if (rate === undefined) {
      return errAsync(
        newError({
          action: "ParseExchangeRateHostResponse",
          kind: "BadGateway",
          layer: "External",
          reason: `ExchangeRate.host response missing rate for ${query.target}.`,
        }),
      );
    }

    const asOf = parsed.data.date ? new Date(parsed.data.date) : new Date();
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

function formatStatusReason(res: Response, body: string): string {
  const summary = body ? `: ${truncate(body)}` : "";
  return `ExchangeRate.host responded with ${res.status} ${res.statusText}${summary}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
