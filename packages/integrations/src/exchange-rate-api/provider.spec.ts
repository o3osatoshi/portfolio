import type { CacheStore, FxQuoteQuery } from "@repo/domain";
import { okAsync } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseErrorMessage } from "@o3osatoshi/toolkit";

import type { ExchangeRateApiConfig } from "./provider";
import { ExchangeRateApi } from "./provider";

type MockResponseOptions = {
  json?: unknown;
  jsonError?: unknown;
  ok?: boolean;
  status?: number;
  statusText?: string;
  text?: string;
};

function buildResponse(options: MockResponseOptions): Response {
  const {
    json,
    jsonError,
    ok = true,
    status = 200,
    statusText = "OK",
    text = "",
  } = options;
  return {
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => {
      if (jsonError) {
        throw jsonError;
      }
      return json;
    },
    ok,
    status,
    statusText,
    text: async () => text,
    url: "https://example.test/api",
  } as Response;
}

const DEFAULT_CONFIG: ExchangeRateApiConfig = {
  apiKey: "key-123",
  baseUrl: "https://example.test/api/",
};

const query = {
  base: "USD",
  quote: "JPY",
} as FxQuoteQuery;

const buildProvider = (overrides: Partial<ExchangeRateApiConfig> = {}) =>
  new ExchangeRateApi({
    ...DEFAULT_CONFIG,
    ...overrides,
  });

describe("integrations/exchange-rate-api ExchangeRateApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds request URL with api key path and returns date-based rate", async () => {
    const lastUpdateUnix = 1_704_153_600;
    const response = buildResponse({
      json: {
        base_code: "USD",
        conversion_rate: "150.25",
        result: "success",
        target_code: "JPY",
        time_last_update_unix: lastUpdateUnix,
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      baseUrl: "https://example.test/api",
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://example.test/api/key-123/pair/USD/JPY");
    expect(init).toEqual({ headers: { Accept: "application/json" } });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.base).toBe("USD");
    expect(result.value.quote).toBe("JPY");
    expect(result.value.rate).toBe("150.25");
    expect(result.value.asOf.getTime()).toBe(lastUpdateUnix * 1000);
  });

  it("uses current time when date is missing", async () => {
    vi.useFakeTimers();
    const now = new Date("2024-02-03T04:05:06Z");
    vi.setSystemTime(now);

    const response = buildResponse({
      json: {
        base_code: "USD",
        conversion_rate: 150,
        result: "success",
        target_code: "JPY",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    const [url] = fetchMock.mock.calls[0] ?? [];
    const parsed = new URL(String(url));
    expect(`${parsed.origin}${parsed.pathname}`).toBe(
      "https://example.test/api/key-123/pair/USD/JPY",
    );
    expect(parsed.search).toBe("");

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.asOf.getTime()).toBe(now.getTime());
    expect(result.value.rate).toBe("150");
  });

  it("returns NotFound error when the API responds with 404", async () => {
    const response = buildResponse({
      json: {
        "error-type": "unsupported-code",
        result: "error",
      },
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalNotFoundError");
    const { reason } = parseErrorMessage(result.error.message);
    expect(reason ?? "").toContain("ExchangeRate API responded with 404");
  });

  it("returns BadGateway error when JSON parsing fails", async () => {
    const response = buildResponse({
      jsonError: new Error("bad json"),
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { action } = parseErrorMessage(result.error.message);
    expect(action).toBe("DeserializeResponseBody");
  });

  it("returns BadGateway error when payload schema is invalid", async () => {
    const response = buildResponse({
      json: {
        conversion_rate: { invalid: true },
        result: "success",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalValidationError");
    const { action } = parseErrorMessage(result.error.message);
    expect(action).toBe("ParseExchangeRateApiResponse");
  });

  it("returns BadGateway error when API signals failure", async () => {
    const response = buildResponse({
      json: {
        "error-type": "invalid-key",
        result: "error",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { reason } = parseErrorMessage(result.error.message);
    expect(reason).toBe("ExchangeRate API error: invalid-key");
  });

  it("returns BadGateway error when the requested rate is missing", async () => {
    const response = buildResponse({
      json: {
        base_code: "USD",
        result: "success",
        target_code: "JPY",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { reason } = parseErrorMessage(result.error.message);
    expect(reason).toBe("ExchangeRate API response missing conversion rate.");
  });

  it("propagates domain validation errors for invalid rates", async () => {
    const response = buildResponse({
      json: {
        base_code: "USD",
        conversion_rate: 0,
        result: "success",
        target_code: "JPY",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });

  it("returns cached data when cache store hits", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(),
      set: vi.fn(),
    };
    const cachedPayload = {
      base_code: "USD",
      conversion_rate: "150.5",
      result: "success",
      target_code: "JPY",
      time_last_update_unix: 1_704_153_600,
    };
    // @ts-expect-error
    cacheStore.get = vi.fn(() => okAsync(cachedPayload));
    // @ts-expect-error
    cacheStore.set = vi.fn(() => okAsync("OK"));
    const fetchMock = vi.fn(async () => buildResponse({ json: cachedPayload }));
    const provider = buildProvider({
      cache: {
        store: cacheStore,
      },
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(cacheStore.get).toHaveBeenCalledTimes(1);
    expect(cacheStore.get).toHaveBeenCalledWith("fx:rate:USD:JPY");
    expect(cacheStore.set).not.toHaveBeenCalled();
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.rate).toBe("150.5");
  });

  it("writes to cache on cache miss", async () => {
    const cacheStore: CacheStore = {
      get: vi.fn(),
      set: vi.fn(),
    };
    cacheStore.get = vi.fn(() => okAsync(null));
    // @ts-expect-error
    cacheStore.set = vi.fn(() => okAsync("OK"));
    const response = buildResponse({
      json: {
        base_code: "USD",
        conversion_rate: "151.25",
        result: "success",
        target_code: "JPY",
        time_last_update_unix: 1_704_153_600,
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = buildProvider({
      cache: {
        store: cacheStore,
      },
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cacheStore.get).toHaveBeenCalledTimes(1);
    expect(cacheStore.set).toHaveBeenCalledTimes(1);
    expect(cacheStore.set).toHaveBeenCalledWith(
      "fx:rate:USD:JPY",
      expect.anything(),
      { ttlMs: 3_600_000 },
    );
    expect(result.isOk()).toBe(true);
  });
});
