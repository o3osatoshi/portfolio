import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildHttpErrorFromPayload,
  buildHttpErrorFromResponse,
  decodeJsonText,
  fetchResponse,
  readResponseJson,
  readResponseText,
} from "./fetch-response";

describe("toolkit fetch-response primitives", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("wraps transport failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await fetchResponse(
      {
        method: "GET",
        url: "https://example.test/data",
      },
      {
        error: {
          action: "FetchExternalApi",
          code: "FETCH_TEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to reach service.",
        },
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("FETCH_TEST_FAILED");
    expect(result.error.details?.action).toBe("FetchExternalApi");
  });

  it("reads response text with structured failures", async () => {
    const response = {
      text: () => Promise.reject(new Error("stream failed")),
    } as Response;

    const result = await readResponseText(response, {
      action: "ReadExternalApiResponseBody",
      code: "READ_TEXT_FAILED",
      kind: "BadGateway",
      reason: "Failed to read response text.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadExternalApiResponseBody");
  });

  it("reads response json with structured failures", async () => {
    const response = {
      json: () => Promise.reject(new Error("invalid json")),
    } as Response;

    const result = await readResponseJson(response, {
      action: "ReadExternalApiResponseJson",
      code: "READ_JSON_FAILED",
      kind: "BadGateway",
      reason: "Failed to read response JSON.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadExternalApiResponseJson");
  });

  it("decodes JSON text", () => {
    const result = decodeJsonText('{"ok":true}', {
      action: "DeserializeExternalApiResponseBody",
      code: "DECODE_JSON_FAILED",
      kind: "BadGateway",
      reason: "Failed to deserialize response JSON.",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({ ok: true });
  });

  it("builds error from structured payload", () => {
    const error = buildHttpErrorFromPayload(
      new Response("{}", { status: 403, statusText: "Forbidden" }),
      {
        code: "CLI_SCOPE_FORBIDDEN",
        details: { reason: "Missing scope." },
      },
      {
        action: "FetchCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "Forbidden",
        layer: "Presentation",
        reason: "API request failed.",
      },
    );

    expect(error.code).toBe("CLI_SCOPE_FORBIDDEN");
    expect(error.details?.reason).toBe("Missing scope.");
    expect(error.meta).toEqual({
      responseBody: {
        code: "CLI_SCOPE_FORBIDDEN",
        details: { reason: "Missing scope." },
      },
      responseErrorCode: "CLI_SCOPE_FORBIDDEN",
      responseStatus: 403,
      responseStatusText: "Forbidden",
    });
  });

  it("builds error from plain text body and truncates it", () => {
    const body = "x".repeat(600);
    const error = buildHttpErrorFromResponse(
      new Response("{}", { status: 502, statusText: "Bad Gateway" }),
      body,
      {
        action: "FetchExternalApi",
        code: "FETCH_HTTP_FAILED",
        kind: "BadGateway",
        reason: "External API request failed.",
      },
    );

    expect(error.details?.reason).toBe(`${"x".repeat(500)}…`);
    expect(error.meta?.["responseBodyText"]).toBe(`${"x".repeat(500)}…`);
  });

  it("falls back when body text is not JSON", () => {
    const error = buildHttpErrorFromResponse(
      new Response("{}", { status: 500, statusText: "Internal Server Error" }),
      "boom",
      {
        action: "FetchExternalApi",
        code: "FETCH_HTTP_FAILED",
        kind: "BadGateway",
        reason: "External API request failed.",
      },
    );

    expect(error.code).toBe("FETCH_HTTP_FAILED");
    expect(error.details?.reason).toBe("boom");
  });
});
