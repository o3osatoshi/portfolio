import type { AuthConfig } from "@repo/auth";
import type { Context, Next } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocks for auth middlewares used by the edge app
const h = vi.hoisted(() => {
  const initAuthConfigMock = vi.fn(
    () => async (_c: Context, next: Next) => next(),
  );
  // By default authorize and set an authUser
  const verifyAuthPass = vi.fn(() => async (c: Context, next: Next) => {
    // @ts-expect-error - authUser shape is provided by @repo/auth
    c.set("authUser", { session: { user: { id: "u-1", name: "Ada" } } });
    return next();
  });
  const verifyAuthDeny = vi.fn(
    () => async (c: Context) => c.json({ error: "unauthorized" }, 401),
  );
  const authHandlerMock = vi.fn(
    () => async (c: Context) => c.json({ auth: true }),
  );
  return {
    authHandlerMock,
    initAuthConfigMock,
    verifyAuthDeny,
    verifyAuthPass,
  };
});

async function loadAppWithVerify(allow: boolean) {
  vi.resetModules();
  vi.doMock("@repo/auth/middleware", () => ({
    authHandler: h.authHandlerMock,
    initAuthConfig: h.initAuthConfigMock,
    verifyAuth: allow ? h.verifyAuthPass : h.verifyAuthDeny,
  }));
  vi.doMock("@o3osatoshi/toolkit", async () => {
    const actual = (await vi.importActual<typeof import("@o3osatoshi/toolkit")>(
      "@o3osatoshi/toolkit",
    )) as typeof import("@o3osatoshi/toolkit");

    const store = new Map<string, unknown>();

    return {
      ...actual,
      createEdgeRedisClient: vi.fn(() => {
        return {
          get: vi.fn((key: string) =>
            Promise.resolve(store.has(key) ? (store.get(key) ?? null) : null),
          ),
          set: vi.fn((key: string, value: unknown) => {
            store.set(key, value);
            return Promise.resolve("OK");
          }),
        };
      }),
    };
  });
  const mod = await import("./app");
  return mod.buildEdgeApp({
    authConfig: {} as AuthConfig,
    redisClientOptions: {
      token: "test-token",
      url: "https://example.upstash.io",
    },
  });
}

describe("http/edge app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("GET /edge/public/healthz returns ok", async () => {
    const app = await loadAppWithVerify(true);
    const res = await app.request("/edge/public/healthz");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("GET /edge/public/heavy returns a timestamp payload", async () => {
    const app = await loadAppWithVerify(true);

    const resPromise = app.request("/edge/public/heavy");
    await vi.advanceTimersByTimeAsync(3_000);
    const res = await resPromise;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { timestamp: string };
    expect(typeof body.timestamp).toBe("string");
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("GET /edge/public/heavy/cached returns cached=false then cached=true with same value", async () => {
    const app = await loadAppWithVerify(true);

    const firstReq = app.request("/edge/public/heavy/cached");
    await vi.advanceTimersByTimeAsync(3_000);
    const firstRes = await firstReq;

    expect(firstRes.status).toBe(200);
    const firstBody = (await firstRes.json()) as {
      cached: boolean;
      timestamp: string;
    };
    expect(firstBody.cached).toBe(false);
    expect(typeof firstBody.timestamp).toBe("string");
    expect(new Date(firstBody.timestamp).toString()).not.toBe("Invalid Date");

    const secondRes = await app.request("/edge/public/heavy/cached");
    expect(secondRes.status).toBe(200);
    const secondBody = (await secondRes.json()) as {
      cached: boolean;
      timestamp: string;
    };

    expect(secondBody.cached).toBe(true);
    expect(secondBody.timestamp).toBe(firstBody.timestamp);
  });

  it("GET /edge/private/me returns current user when authorized", async () => {
    const app = await loadAppWithVerify(true);
    const res = await app.request("/edge/private/me");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: "u-1", name: "Ada" });
  });

  it("responds 401 when verifyAuth denies the request", async () => {
    const app = await loadAppWithVerify(false);
    const res = await app.request("/edge/private/me");
    expect(res.status).toBe(401);
  });
});
