import { describe, expect, it, vi } from "vitest";

import { createSlackClient } from "./client";

describe("integrations/slack createSlackClient", () => {
  it("posts messages with the configured base URL and token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ channel: "C1", ok: true, ts: "1" }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const client = createSlackClient(
      {
        apiBaseUrl: "https://example.test",
        token: "token-123",
      },
      {
        fetch: fetchMock as unknown as typeof fetch,
      },
    );

    const result = await client.postMessage({
      channel: "C1",
      text: "hello",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.test/chat.postMessage");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({
      Authorization: "Bearer token-123",
      "Content-Type": "application/json; charset=utf-8",
    });
    const body = JSON.parse(String(options.body));
    expect(body).toEqual({ channel: "C1", text: "hello" });
  });

  it("rejects messages without text or blocks", async () => {
    const fetchMock = vi.fn();
    const client = createSlackClient(
      {
        token: "token-123",
      },
      {
        fetch: fetchMock as unknown as typeof fetch,
      },
    );

    const result = await client.postMessage({ channel: "C1" });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ExternalValidationError");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("wraps fetch failures as ExternalUnavailableError", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const client = createSlackClient(
      {
        token: "token-123",
      },
      {
        fetch: fetchMock as unknown as typeof fetch,
      },
    );

    const result = await client.postMessage({
      channel: "C1",
      text: "hello",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ExternalUnavailableError");
  });

  it("maps ratelimited responses to ExternalRateLimitError", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "ratelimited", ok: false }), {
        headers: { "content-type": "application/json" },
        status: 429,
      }),
    );
    const client = createSlackClient(
      {
        token: "token-123",
      },
      {
        fetch: fetchMock as unknown as typeof fetch,
      },
    );

    const result = await client.postMessage({
      channel: "C1",
      text: "hello",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ExternalRateLimitError");
  });

  it("maps Slack ok=false responses to ExternalUnauthorizedError", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_auth", ok: false }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );
    const client = createSlackClient(
      {
        token: "token-123",
      },
      {
        fetch: fetchMock as unknown as typeof fetch,
      },
    );

    const result = await client.postMessage({
      channel: "C1",
      text: "hello",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ExternalUnauthorizedError");
  });
});
