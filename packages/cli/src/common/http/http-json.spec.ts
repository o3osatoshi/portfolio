import { err, ok } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { readHttpJsonWithParser, requestHttpJsonWithParser } from "./http-json";

describe("common/http/http-json", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed value when JSON and parser both succeed", async () => {
    const parser = vi.fn((input: unknown) => ok({ value: input }));

    const result = await readHttpJsonWithParser(
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

    const result = await readHttpJsonWithParser(
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

  it("returns transport error when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await requestHttpJsonWithParser(
      "https://example.com/data",
      { method: "GET" },
      {
        parser: (input) => ok(input),
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
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("RequestCliApi");
  });

  it("returns status error when response is non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("Forbidden", { status: 403 })),
    );

    const result = await requestHttpJsonWithParser(
      "https://example.com/data",
      { method: "GET" },
      {
        parser: (input) => ok(input),
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
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe(
      "Failed to reach the API endpoint. (403)",
    );
  });

  it("returns read error when response body cannot be read", async () => {
    const response = {
      json: () => Promise.reject(new Error("body failed")),
      ok: true,
    } as Response;

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    const result = await requestHttpJsonWithParser(
      "https://example.com/data",
      { method: "GET" },
      {
        parser: (input) => ok(input),
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
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadCliApiResponseBody");
  });
});
