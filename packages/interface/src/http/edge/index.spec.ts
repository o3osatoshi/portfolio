import { describe, expect, it } from "vitest";

import { buildEdgeApp } from "./index";

describe("http/edge/index", () => {
  it("serves health check", async () => {
    const app = buildEdgeApp({});
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
