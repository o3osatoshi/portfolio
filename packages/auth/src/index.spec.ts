import { describe, expect, it, vi } from "vitest";

// Hoist all mock references used inside vi.mock factories
const h = vi.hoisted(() => {
  const prismaMock = { _type: "prisma" } as const;
  const adapterReturn = { _type: "adapter", prisma: prismaMock } as const;
  const PrismaAdapterMock = vi.fn(() => adapterReturn);

  const authFn = vi.fn();
  const handlersObject = { GET: vi.fn(), POST: vi.fn() } as const;
  const NextAuthMock = vi.fn((_config: unknown) => ({
    auth: authFn,
    handlers: handlersObject,
  }));
  return {
    adapterReturn,
    authFn,
    handlersObject,
    NextAuthMock,
    PrismaAdapterMock,
    prismaMock,
  };
});

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: h.PrismaAdapterMock }));
vi.mock("@repo/prisma", () => ({ prisma: h.prismaMock }));
vi.mock("next-auth", () => ({ default: h.NextAuthMock }));

import { authConfig } from "./config";
// Import after mocks are set up so module init uses our stubs
import { getUserId, handlers } from "./index";

describe("@repo/auth root entry", () => {
  it("initializes NextAuth once with PrismaAdapter + jwt strategy", () => {
    expect(h.NextAuthMock).toHaveBeenCalledTimes(1);
    const cfg = h.NextAuthMock.mock.calls[0]?.[0] as {
      adapter: unknown;
      callbacks: typeof authConfig.callbacks;
      session: { strategy: string };
    };

    // Adapter wired with prisma from @repo/prisma
    expect(h.PrismaAdapterMock).toHaveBeenCalledWith(h.prismaMock);
    expect(cfg.adapter).toBe(h.adapterReturn);

    // Session strategy forced to jwt
    expect(cfg.session).toEqual({ strategy: "jwt" });

    // authConfig spread should forward callbacks reference
    expect(cfg.callbacks).toBe(authConfig.callbacks);
  });

  it("re-exports handlers from NextAuth result", () => {
    expect(handlers).toBe(h.handlersObject);
  });

  it("getUserId returns undefined when no session", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce(undefined);
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns undefined when session has no user id", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce({ user: { name: "Ada" } });
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns user id when available", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce({ user: { id: "user-123" } });
    await expect(getUserId()).resolves.toBe("user-123");
  });
});
