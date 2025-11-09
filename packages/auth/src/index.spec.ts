import { beforeEach, describe, expect, it, vi } from "vitest";

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
  const createPrismaClientMock = vi.fn(() => prismaMock);
  return {
    adapterReturn,
    authFn,
    createPrismaClientMock,
    handlersObject,
    NextAuthMock,
    PrismaAdapterMock,
    prismaMock,
  };
});

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: h.PrismaAdapterMock }));
vi.mock("@repo/prisma", () => ({
  createPrismaClient: h.createPrismaClientMock,
}));
vi.mock("next-auth", () => ({ default: h.NextAuthMock }));

import { authConfig } from "./config";
import { createAuth } from "./index";

describe("@repo/auth createAuth factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes NextAuth with PrismaAdapter + jwt strategy (injected prisma)", () => {
    // @ts-expect-error
    const { handlers } = createAuth({ prisma: h.prismaMock });
    expect(handlers).toBe(h.handlersObject);

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

  it("getUserId returns undefined when no session", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce(undefined);
    // @ts-expect-error
    const { getUserId } = createAuth({ prisma: h.prismaMock });
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns undefined when session has no user id", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce({ user: { name: "Ada" } });
    // @ts-expect-error
    const { getUserId } = createAuth({ prisma: h.prismaMock });
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns user id when available", async () => {
    h.authFn.mockReset();
    h.authFn.mockResolvedValueOnce({ user: { id: "user-123" } });
    // @ts-expect-error
    const { getUserId } = createAuth({ prisma: h.prismaMock });
    await expect(getUserId()).resolves.toBe("user-123");
  });
});
