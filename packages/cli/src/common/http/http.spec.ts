import { err, ok } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import {
  decodeHttpJson,
  expectOkHttpResponse,
  readHttpJson,
  readHttpText,
  readParsedJson,
  requestHttp,
  requestJson,
} from "./http";

describe("common/http/http", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns RichError when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await requestHttp(
      "https://example.com/data",
      { method: "GET" },
      {
        action: "FetchExternalApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to reach the API endpoint.",
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_API_REQUEST_FAILED");
    expect(result.error.details?.action).toBe("FetchExternalApi");
    expect(result.error.details?.reason).toBe(
      "Failed to reach the API endpoint.",
    );
    expect(result.error.kind).toBe("BadGateway");
  });

  it("returns status-aware reason for non-2xx responses", () => {
    const result = expectOkHttpResponse(
      new Response("Forbidden", { status: 403 }),
      {
        action: "RequestCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "Forbidden",
        reason: "API request failed.",
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe("API request failed. (403)");
  });

  it("returns RichError when response text cannot be read", async () => {
    const response = {
      text: () => Promise.reject(new Error("stream failed")),
    } as Response;

    const result = await readHttpText(response, {
      action: "ReadCliApiResponseBody",
      code: "CLI_API_REQUEST_FAILED",
      kind: "BadGateway",
      reason: "Failed to read API response body.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadCliApiResponseBody");
  });

  it("returns RichError when response json cannot be read", async () => {
    const response = {
      json: () => Promise.reject(new Error("invalid json stream")),
    } as Response;

    const result = await readHttpJson(response, {
      action: "ReadOidcDiscoveryResponseBody",
      code: "CLI_AUTH_LOGIN_FAILED",
      kind: "BadGateway",
      reason: "Failed to read OIDC discovery response body.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadOidcDiscoveryResponseBody");
  });

  it("returns RichError when JSON text is invalid", () => {
    const result = decodeHttpJson("{invalid", {
      action: "DecodeCliApiResponseBody",
      code: "CLI_API_REQUEST_FAILED",
      kind: "BadGateway",
      reason: "API response was not valid JSON.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("DecodeCliApiResponseBody");
  });

  it("returns parsed value when JSON and parser both succeed", async () => {
    const parser = vi.fn((input: unknown) => ok({ value: input }));

    const result = await readParsedJson(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
      {
        action: "ReadCliApiResponseBody",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to read API response body.",
      },
      parser,
    );

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({ value: { ok: true } });
  });

  it("returns parser error when JSON is valid but schema parsing fails", async () => {
    const parser = vi.fn(() =>
      err(
        newRichError({
          code: "CLI_COMMAND_INVALID_ARGUMENT",
          details: {
            action: "DecodeCliPayload",
            reason: "Schema parsing failed.",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
        }),
      ),
    );

    const result = await readParsedJson(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
      {
        action: "ReadCliApiResponseBody",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to read API response body.",
      },
      parser,
    );

    expect(result.isErr()).toBe(true);
  });

  it("returns transport error when JSON request fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await requestJson(
      "https://example.com/data",
      { method: "GET" },
      {
        read: {
          action: "ReadCliApiResponseBody",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to read API response body.",
        },
        request: {
          action: "RequestCliApi",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to reach the API endpoint.",
        },
      },
      (input) => ok(input),
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("RequestCliApi");
  });

  it("returns status error when JSON request response is non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("Forbidden", { status: 403 })),
    );

    const result = await requestJson(
      "https://example.com/data",
      { method: "GET" },
      {
        read: {
          action: "ReadCliApiResponseBody",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to read API response body.",
        },
        request: {
          action: "RequestCliApi",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to reach the API endpoint.",
        },
      },
      (input) => ok(input),
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe(
      "Failed to reach the API endpoint. (403)",
    );
  });

  it("returns read error when JSON request body cannot be read", async () => {
    const response = {
      json: () => Promise.reject(new Error("body failed")),
      ok: true,
    } as Response;

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    const result = await requestJson(
      "https://example.com/data",
      { method: "GET" },
      {
        read: {
          action: "ReadCliApiResponseBody",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to read API response body.",
        },
        request: {
          action: "RequestCliApi",
          code: "CLI_API_REQUEST_FAILED",
          kind: "BadGateway",
          reason: "Failed to reach the API endpoint.",
        },
      },
      (input) => ok(input),
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadCliApiResponseBody");
  });
});
