import { afterEach, describe, expect, it, vi } from "vitest";

import { createInterfaceClientEdge } from "./client";

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
        edge: { healthz: { $get: () => Promise<Response> } };
      }
    ).edge.healthz.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlArg = String(fetchMock.mock.calls[0]?.[0]);
    expect(urlArg.endsWith("/edge/healthz")).toBe(true);
    expect(urlArg.startsWith("http://localhost")).toBe(true);
  });
});
