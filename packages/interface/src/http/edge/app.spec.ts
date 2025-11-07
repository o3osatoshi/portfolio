import { describe, expect, it } from "vitest";

import { buildEdgeApp, type EdgeDeps } from "./app";

function makeDeps(_overrides: Partial<EdgeDeps> = {}): EdgeDeps {
  return {} as EdgeDeps;
}

describe("http/edge/app", () => {
  it("serves health check", async () => {
    const app = buildEdgeApp(makeDeps());
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  // /todos routes were removed; corresponding tests deleted.
});
