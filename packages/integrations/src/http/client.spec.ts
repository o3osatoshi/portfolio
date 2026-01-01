import type { CacheStore } from "@repo/domain";
import { okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@o3osatoshi/logging";
import { parseErrorMessage } from "@o3osatoshi/toolkit";

import { createServerFetchClient } from "./client";

const buildLogger = () => {
  // @ts-expect-error
  const logger = {
    // @ts-expect-error
    child: vi.fn(() => logger),
    debug: vi.fn(),
    error: vi.fn(),
    event: vi.fn(),
    flush: vi.fn(async () => {}),
    info: vi.fn(),
    metric: vi.fn(),
    warn: vi.fn(),
  } satisfies Logger;
  return logger;
};

describe("integrations/http createServerFetchClient", () => {
  it("serves cached responses without calling fetch", async () => {
    const cacheStore: CacheStore = {
      // @ts-expect-error
      get: vi.fn(() => okAsync({ value: "cached" })),
      // @ts-expect-error
      set: vi.fn(() => okAsync("OK")),
    };
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ value: "fresh" }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createServerFetchClient<{ value: string }>({
      cache: {
        getKey: () => "cache:key",
        store: cacheStore,
      },
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await client({
      parse: async () => ({ value: "fresh" }),
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.value.cached).toBe(true);
    expect(result.value.data).toEqual({ value: "cached" });
  });

  it("honors logging toggles", async () => {
    const logger = buildLogger();
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    });
    const client = createServerFetchClient<{ ok: boolean }>({
      fetch: fetchMock as unknown as typeof fetch,
      logging: {
        enableEvents: false,
        enableMetrics: true,
        logger,
        requestName: "client_test",
      },
    });

    const result = await client({ url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(logger.metric).toHaveBeenCalledTimes(2);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("does not retry when retry is undefined", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("fetch failed");
    });
    const client = createServerFetchClient({
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await client({ url: "https://example.test" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    const { action } = parseErrorMessage(result.error.message);
    expect(action).toBe("FetchExternalApi");
  });
});
