import { err, ok, okAsync } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { newRichError } from "@o3osatoshi/toolkit";

import {
  expectOkHttpResponse,
  fetchJson,
  readParsedJson,
  runJsonFetch,
} from "./fetch";

describe("common/http/fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns status-aware reason for non-2xx responses", () => {
    const result = expectOkHttpResponse(
      new Response("Forbidden", { status: 403 }),
      {
        action: "FetchCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "Forbidden",
        reason: "API request failed.",
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe("API request failed. (403)");
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

  it("runs shared JSON request flow with decode", async () => {
    const decode = { schema: z.unknown() };
    const execute = vi.fn(() => okAsync({ ok: true }));
    const decoder = vi.fn(() => ok({ decoded: true }));

    const result = await runJsonFetch(
      execute,
      {
        body: JSON.stringify({ ok: true }),
        decode,
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      decoder,
    );

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({ decoded: true });
    expect(execute).toHaveBeenCalledWith({
      body: JSON.stringify({ ok: true }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(decoder).toHaveBeenCalledWith({ ok: true }, decode);
  });

  it("returns transport error when JSON request fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await fetchJson({
      decode: {
        context: {
          action: "DecodeCliPayload",
          code: "CLI_API_REQUEST_FAILED",
          context: "CLI payload",
        },
        schema: z.unknown(),
      },
      method: "GET",
      read: {
        action: "ReadCliApiResponseBody",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to read API response body.",
      },
      request: {
        action: "FetchCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to reach the API endpoint.",
      },
      url: "https://example.com/data",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("FetchCliApi");
  });

  it("returns status error when JSON request response is non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            error_description: "Invalid audience.",
          }),
          {
            headers: { "content-type": "application/json" },
            status: 403,
            statusText: "Forbidden",
          },
        ),
      ),
    );

    const result = await fetchJson({
      decode: {
        context: {
          action: "DecodeCliPayload",
          code: "CLI_API_REQUEST_FAILED",
          context: "CLI payload",
        },
        schema: z.unknown(),
      },
      method: "GET",
      read: {
        action: "ReadCliApiResponseBody",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to read API response body.",
      },
      request: {
        action: "FetchCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to reach the API endpoint.",
      },
      url: "https://example.com/data",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe("Invalid audience.");
  });

  it("returns read error when JSON request body cannot be read", async () => {
    const response = {
      json: () => Promise.reject(new Error("body failed")),
      ok: true,
    } as Response;

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    const result = await fetchJson({
      decode: {
        context: {
          action: "DecodeCliPayload",
          code: "CLI_API_REQUEST_FAILED",
          context: "CLI payload",
        },
        schema: z.unknown(),
      },
      method: "GET",
      read: {
        action: "ReadCliApiResponseBody",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to read API response body.",
      },
      request: {
        action: "FetchCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to reach the API endpoint.",
      },
      url: "https://example.com/data",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadCliApiResponseBody");
  });
});
