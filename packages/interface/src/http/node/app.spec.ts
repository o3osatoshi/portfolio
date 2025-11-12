import type { AuthConfig } from "@hono/auth-js";
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

const testAuthConfig: AuthConfig = {
  providers: [],
  // Minimal config for tests; no providers means all requests are unauthenticated
  basePath: "/api/auth",
  secret: "test-secret",
};

describe("http/node/app", () => {
  it("healthz is protected without auth (401)", async () => {
    const app = buildApp({
      authConfig: testAuthConfig,
      // @ts-expect-error
      transactionRepo: noopRepo,
    });
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(401);
  });

  it("GET handler enforces auth for healthz", async () => {
    const { GET } = buildHandler({
      authConfig: testAuthConfig,
      // @ts-expect-error
      transactionRepo: noopRepo,
    });
    const res = await GET(new Request("http://test.local/api/healthz"));
    expect(res.status).toBe(401);
  });

  it("transactions route returns 401 when unauthenticated", async () => {
    const app = buildApp({
      authConfig: testAuthConfig,
      // @ts-expect-error
      transactionRepo: noopRepo,
    });
    const res = await app.request("/api/labs/transactions");
    expect(res.status).toBe(401);
  });
});
