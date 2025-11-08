import { describe, expect, it } from "vitest";

import { buildEdgeApp, buildEdgeHandler } from "./app";

describe("http/edge/app", () => {
  it("serves health check", async () => {
    const app = buildEdgeApp({});
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("Edge handlers respond to healthz via GET/POST bindings", async () => {
    const { GET, POST } = buildEdgeHandler({});
    const r1 = await GET(new Request("http://test.local/edge/healthz"));
    expect(r1.status).toBe(200);
    expect(await r1.json()).toEqual({ ok: true });

    const r2 = await POST(
      new Request("http://test.local/edge/healthz", { method: "POST" }),
    );
    // healthz route only implements GET; POST falls through to 404
    expect([200, 404]).toContain(r2.status);
  });
});
