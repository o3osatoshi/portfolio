import { describe, expect, it } from "vitest";

import { buildApp, type Deps } from "./app";

const noopRepo = {
  create: async () => {
    throw new Error("not implemented");
  },
  delete: async () => undefined,
  findById: async () => null,
  findByUserId: async () => [],
  update: async () => undefined,
};

function makeDeps(overrides: Partial<Deps> = {}): Deps {
  return {
    transactionRepo: noopRepo,
    ...(overrides as Deps),
  } as Deps;
}

describe("http/node/app", () => {
  it("serves health check", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  // /todos routes were removed; corresponding tests deleted.
});
