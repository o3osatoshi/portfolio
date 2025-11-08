import { describe, expect, it } from "vitest";

import { buildApp, buildHandler } from "./app";

const noopRepo = {
  create: async () => {
    throw new Error("not implemented");
  },
  delete: async () => undefined,
  findById: async () => null,
  findByUserId: async () => [],
  update: async () => undefined,
};

describe("http/node/app", () => {
  it("serves health check", async () => {
    // @ts-expect-error
    const app = buildApp({ transactionRepo: noopRepo });
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("GET handler responds to healthz", async () => {
    // @ts-expect-error
    const { GET } = buildHandler({ transactionRepo: noopRepo });
    const res = await GET(new Request("http://test.local/api/healthz"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
