import type { AuthConfig } from "@repo/auth";
import type { Context, Next } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks for auth middlewares used by the edge app
const h = vi.hoisted(() => {
  const initAuthConfigMock = vi.fn(
    () => async (_c: Context, next: Next) => next(),
  );
  // By default authorize and set an authUser
  const verifyAuthPass = vi.fn(() => async (c: Context, next: Next) => {
    // @ts-expect-error
    c.set("authUser", { session: { user: { id: "u-1", name: "Ada" } } });
    return next();
  });
  const verifyAuthDeny = vi.fn(
    () => async (c: Context) => c.json({ error: "unauthorized" }, 401),
  );
  return { initAuthConfigMock, verifyAuthDeny, verifyAuthPass };
});

async function loadAppWithVerify(allow: boolean) {
  vi.resetModules();
  vi.doMock("@repo/auth/middleware", () => ({
    initAuthConfig: h.initAuthConfigMock,
    verifyAuth: allow ? h.verifyAuthPass : h.verifyAuthDeny,
  }));
  const mod = await import("./app");
  return mod.buildEdgeApp({ authConfig: {} as AuthConfig });
}

describe("http/edge app", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /edge/healthz returns ok when authorized", async () => {
    const app = await loadAppWithVerify(true);
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("GET /edge/me returns current user when authorized", async () => {
    const app = await loadAppWithVerify(true);
    const res = await app.request("/edge/me");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: "u-1", name: "Ada" });
  });

  it("responds 401 when verifyAuth denies the request", async () => {
    const app = await loadAppWithVerify(false);
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(401);
  });
});
