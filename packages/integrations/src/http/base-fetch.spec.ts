import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { parseErrorMessage } from "@o3osatoshi/toolkit";

import { createSmartFetch } from "./smart-fetch";

describe("integrations/http createSmartFetch", () => {
  it("parses JSON responses by default", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.object({ ok: z.boolean() });
    const result = await client({
      decode: { schema },
      url: "https://example.test",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.data).toEqual({ ok: true });
    expect(result.value.response?.status).toBe(200);
  });

  it("parses text responses when content-type is not JSON", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify("hello"), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.string();
    const result = await client({
      decode: { schema },
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.data).toBe("hello");
  });

  it("returns null when the response body is null", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response("null", {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.null();
    const result = await client({
      decode: { schema },
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value.data).toBeNull();
  });

  it("wraps parse errors as ExternalBadGatewayError", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response("not-json", {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.unknown();
    const result = await client({
      decode: { schema },
      url: "https://example.test",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalBadGatewayError");
    const { action } = parseErrorMessage(result.error.message);
    expect(action).toBe("DeserializeResponseBody");
  });

  it("wraps fetch failures as ExternalUnavailableError", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("fetch failed");
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.unknown();
    const result = await client({
      decode: { schema },
      url: "https://example.test",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.name).toBe("ExternalUnavailableError");
    const { action } = parseErrorMessage(result.error.message);
    expect(action).toBe("FetchExternalApi");
  });

  it("forwards method, headers, body, and signal", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify("ok"), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createSmartFetch({ fetch: fetchMock });

    const schema = z.string();
    const result = await client({
      body: "payload",
      decode: { schema },
      headers: { "x-test": "1" },
      method: "POST",
      timeoutMs: 50,
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    const [_url, init] = fetchMock.mock.calls[0] ?? [];
    expect(_url).toBe("https://example.test");
    // @ts-expect-error
    expect(init?.method).toBe("POST");
    // @ts-expect-error
    expect(init?.headers).toEqual({ "x-test": "1" });
    // @ts-expect-error
    expect(init?.body).toBe("payload");
    // @ts-expect-error
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
});
