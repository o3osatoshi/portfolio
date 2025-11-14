import { afterEach, describe, expect, it, vi } from "vitest";

import { createInterfaceClient, createInterfaceClientEdge } from "./client";

describe("rpc-client/client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a client that performs fetch calls to the baseURL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const client = createInterfaceClient("http://localhost");
    const res = await (
      client as unknown as {
        api: { public: { healthz: { $get: () => Promise<Response> } } };
      }
    ).api.public.healthz.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlArg = String(fetchMock.mock.calls[0]?.[0]);
    expect(urlArg.endsWith("/api/public/healthz")).toBe(true);
    expect(urlArg.startsWith("http://localhost")).toBe(true);
  });
});

describe("rpc-client/client-edge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an edge client that calls /edge/* under the baseURL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const client = createInterfaceClientEdge("http://localhost");
    const res = await (
      client as unknown as {
        edge: { public: { healthz: { $get: () => Promise<Response> } } };
      }
    ).edge.public.healthz.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlArg = String(fetchMock.mock.calls[0]?.[0]);
    expect(urlArg.endsWith("/edge/public/healthz")).toBe(true);
    expect(urlArg.startsWith("http://localhost")).toBe(true);
  });
});
