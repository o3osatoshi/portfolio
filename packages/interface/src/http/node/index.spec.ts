import { describe, expect, it } from "vitest";

import { buildApp, buildHandler } from "./index";

const noopRepo = {
  create: async () => {
    throw new Error("not implemented");
  },
  delete: async () => undefined,
  findById: async () => null,
  findByUserId: async () => [],
  update: async () => undefined,
};

describe("node/index", () => {
  it("builds an app that serves /api/healthz", async () => {
    const app = buildApp({ transactionRepo: noopRepo } as any);
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("GET handler responds to healthz", async () => {
    const { GET } = buildHandler({ transactionRepo: noopRepo } as any);
    const res = await GET(new Request("http://test.local/api/healthz"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  // /api/todos routes were removed; POST handler test deleted.
});
