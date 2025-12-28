import { afterEach, describe, expect, it, vi } from "vitest";

import { createProxyHandler, createProxyTransport } from "./proxy";
import type { LogEvent, Transport } from "./types";

const createEvent = (message: string): LogEvent =>
  ({ message, timestamp: "2024-01-01T00:00:00.000Z" }) as LogEvent;

describe("proxy transport", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("throws when fetch is unavailable", () => {
    vi.stubGlobal("fetch", undefined);

    expect(() => createProxyTransport({ url: "/api/logging" })).toThrow(
      "fetch is required to use the proxy transport",
    );
  });

  it("sends buffered events to the proxy endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const transport = createProxyTransport({
      fetch: fetchMock,
      url: "/api/logging",
    });

    transport.emit("logs", createEvent("hello"));
    await transport.flush?.();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/logging");

    const body = JSON.parse((init?.body as string) ?? "{}") as {
      eventSets: Array<{ dataset: string; event: LogEvent }>;
    };

    expect(body.eventSets).toHaveLength(1);
    expect(body.eventSets[0]?.dataset).toBe("logs");
    expect(body.eventSets[0]?.event.message).toBe("hello");
  });

  it("includes headers and credentials in proxy requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const transport = createProxyTransport({
      credentials: "include",
      fetch: fetchMock,
      headers: { "x-proxy": "1" },
      url: "/api/logging",
    });

    transport.emit("logs", createEvent("hello"));
    await transport.flush?.();

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;

    expect(init?.credentials).toBe("include");
    expect(headers).toEqual(
      expect.objectContaining({
        "content-type": "application/json",
        "x-proxy": "1",
      }),
    );
  });

  it("auto-flushes on the configured interval", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const transport = createProxyTransport({
      fetch: fetchMock,
      flushIntervalMs: 100,
      url: "/api/logging",
    });

    transport.emit("logs", createEvent("hello"));

    expect(fetchMock).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops oldest events when buffer overflows", async () => {
    vi.useFakeTimers();
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetchMock = vi.fn().mockImplementation(() => {
      if (!resolveFetch) {
        return new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        });
      }
      return Promise.resolve({ ok: true } as Response);
    });
    const onError = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const transport = createProxyTransport({
      fetch: fetchMock,
      maxBatchSize: 1,
      maxBufferSize: 1,
      onError,
      url: "/api/logging",
    });

    transport.emit("logs", createEvent("one"));
    transport.emit("logs", createEvent("two"));
    transport.emit("logs", createEvent("three"));

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "proxy transport buffer overflow",
      }),
    );

    resolveFetch?.({ ok: true } as Response);
    await vi.runAllTimersAsync();

    const messages = fetchMock.mock.calls.flatMap((call) => {
      const body = JSON.parse((call[1]?.body as string) ?? "{}") as {
        eventSets: Array<{ event: LogEvent }>;
      };
      return body.eventSets.map((event) => event.event.message);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(messages).toEqual(["one", "three"]);
  });

  it("does not retry failed sends automatically", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);
    const onError = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const transport = createProxyTransport({
      fetch: fetchMock,
      onError,
      url: "/api/logging",
    });

    transport.emit("logs", createEvent("fail"));
    await transport.flush?.();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await transport.flush?.();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("proxy handler", () => {
  it("rejects non-POST requests", async () => {
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ transport });
    const response = await handler(new Request("http://example.test"));

    expect(response.status).toBe(405);
  });

  it("rejects invalid JSON payloads", async () => {
    const onError = vi.fn();
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ onError, transport });
    const request = new Request("http://example.test", {
      body: "{invalid}",
      method: "POST",
    });

    const response = await handler(request);

    expect(response.status).toBe(400);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("rejects missing eventSets payloads", async () => {
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ transport });
    const request = new Request("http://example.test", {
      body: JSON.stringify({}),
      method: "POST",
    });

    const response = await handler(request);

    expect(response.status).toBe(400);
  });

  it("rejects oversized payloads", async () => {
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ maxEvents: 1, transport });
    const request = new Request("http://example.test", {
      body: JSON.stringify({
        eventSets: [
          { dataset: "logs", event: createEvent("one") },
          { dataset: "logs", event: createEvent("two") },
        ],
      }),
      method: "POST",
    });

    const response = await handler(request);

    expect(response.status).toBe(413);
  });

  it("rejects invalid datasets and events", async () => {
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ transport });

    const invalidDataset = await handler(
      new Request("http://example.test", {
        body: JSON.stringify({
          eventSets: [{ dataset: 1, event: createEvent("bad") }],
        }),
        method: "POST",
      }),
    );

    expect(invalidDataset.status).toBe(400);

    const invalidEvent = await handler(
      new Request("http://example.test", {
        body: JSON.stringify({
          eventSets: [{ dataset: "logs", event: null }],
        }),
        method: "POST",
      }),
    );

    expect(invalidEvent.status).toBe(400);
  });

  it("emits grouped events and flushes", async () => {
    const emit = vi.fn();
    const flush = vi.fn().mockResolvedValue(undefined);
    const transport: Transport = { emit, flush };

    const handler = createProxyHandler({
      allowDatasets: ["logs", "metrics"],
      transport,
    });

    const request = new Request("http://example.test", {
      body: JSON.stringify({
        eventSets: [
          { dataset: "logs", event: createEvent("one") },
          { dataset: "metrics", event: createEvent("two") },
        ],
      }),
      method: "POST",
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(flush).toHaveBeenCalledTimes(1);
  });

  it("groups events for the same dataset into a batch", async () => {
    const emit = vi.fn();
    const transport: Transport = {
      emit,
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ transport });
    const response = await handler(
      new Request("http://example.test", {
        body: JSON.stringify({
          eventSets: [
            { dataset: "logs", event: createEvent("one") },
            { dataset: "logs", event: createEvent("two") },
          ],
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      "logs",
      expect.arrayContaining([
        expect.objectContaining({ message: "one" }),
        expect.objectContaining({ message: "two" }),
      ]),
    );
  });

  it("rejects disallowed datasets", async () => {
    const transport: Transport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({
      allowDatasets: ["logs"],
      transport,
    });

    const request = new Request("http://example.test", {
      body: JSON.stringify({
        eventSets: [{ dataset: "metrics", event: createEvent("blocked") }],
      }),
      method: "POST",
    });

    const response = await handler(request);

    expect(response.status).toBe(403);
  });

  it("returns 500 when transport throws", async () => {
    const onError = vi.fn();
    const transport: Transport = {
      emit: () => {
        throw new Error("emit failed");
      },
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const handler = createProxyHandler({ onError, transport });
    const response = await handler(
      new Request("http://example.test", {
        body: JSON.stringify({
          eventSets: [{ dataset: "logs", event: createEvent("oops") }],
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(500);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
