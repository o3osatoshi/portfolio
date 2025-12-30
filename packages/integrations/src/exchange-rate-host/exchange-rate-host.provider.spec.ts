import type { ExchangeRateQuery } from "@repo/domain";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseErrorMessage } from "@o3osatoshi/toolkit";

import { ExchangeRateHostProvider } from "./exchange-rate-host.provider";

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
  } as Response;
}

const query = {
  base: "USD",
  target: "JPY",
} as ExchangeRateQuery;

describe("integrations/exchange-rate-host ExchangeRateHostProvider", () => {
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
    const provider = new ExchangeRateHostProvider({
      apiKey: "key-123",
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
    expect(result.value.target).toBe("JPY");
    expect(result.value.rate).toBe("150.25");
    expect(result.value.asOf.getTime()).toBe(lastUpdateUnix * 1000);
  });

  it("omits api key and uses current time when date is missing", async () => {
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
    const provider = new ExchangeRateHostProvider({
      baseUrl: "https://example.test/api/",
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    const [url] = fetchMock.mock.calls[0] ?? [];
    const parsed = new URL(String(url));
    expect(`${parsed.origin}${parsed.pathname}`).toBe(
      "https://example.test/api/pair/USD/JPY",
    );
    expect(parsed.search).toBe("");

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.asOf.getTime()).toBe(now.getTime());
    expect(result.value.rate).toBe("150");
  });

  it("returns NotFound error when the API responds with 404", async () => {
    const response = buildResponse({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: "no such route",
    });
    const fetchMock = vi.fn(async () => response);
    const provider = new ExchangeRateHostProvider({
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
    const provider = new ExchangeRateHostProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { reason } = parseErrorMessage(result.error.message);
    expect(reason).toBe("Failed to parse ExchangeRate API JSON response.");
  });

  it("returns BadGateway error when payload schema is invalid", async () => {
    const response = buildResponse({
      json: {
        conversion_rate: { invalid: true },
        result: "success",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = new ExchangeRateHostProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { reason } = parseErrorMessage(result.error.message);
    expect(reason).toBe("ExchangeRate API payload did not match schema.");
  });

  it("returns BadGateway error when API signals failure", async () => {
    const response = buildResponse({
      json: {
        "error-type": "invalid-key",
        result: "error",
      },
    });
    const fetchMock = vi.fn(async () => response);
    const provider = new ExchangeRateHostProvider({
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
    const provider = new ExchangeRateHostProvider({
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
    const provider = new ExchangeRateHostProvider({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.getRate(query);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("DomainValidationError");
  });
});
