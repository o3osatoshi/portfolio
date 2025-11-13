import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks referenced inside vi.mock factories
const h = vi.hoisted(() => {
  const prismaClient = { _type: "prisma" } as const;
  const adapterReturn = { _type: "adapter", prisma: prismaClient } as const;
  const PrismaAdapterMock = vi.fn(() => adapterReturn);

  const providerReturn = { name: "google", _type: "provider" } as const;
  const GoogleProviderMock = vi.fn(
    (_opts: { clientId: string; clientSecret: string }) => providerReturn,
  );

  return {
    GoogleProviderMock,
    providerReturn,
    adapterReturn,
    PrismaAdapterMock,
    prismaClient,
  };
});

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: h.PrismaAdapterMock }));
vi.mock("@auth/core/providers/google", () => ({
  default: h.GoogleProviderMock,
}));

import { createAuthConfig } from "./index";

describe("hono-auth createAuthConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates config with Google provider, PrismaAdapter, default basePath", () => {
    const cfg = createAuthConfig({
      providers: {
        google: { clientId: "g-id", clientSecret: "g-secret" },
      },
      // @ts-expect-error
      prismaClient: h.prismaClient,
      secret: "s3cr3t",
    });

    // Provider called with supplied credentials and returned in providers array
    expect(h.GoogleProviderMock).toHaveBeenCalledWith({
      clientId: "g-id",
      clientSecret: "g-secret",
    });
    expect(cfg.providers).toHaveLength(1);
    expect(cfg.providers[0]).toBe(h.providerReturn);

    // Adapter wired with provided prisma client
    expect(h.PrismaAdapterMock).toHaveBeenCalledWith(h.prismaClient);
    expect(cfg.adapter).toBe(h.adapterReturn);

    // Defaults + pass-throughs
    expect(cfg.basePath).toBe("/api/auth");
    expect(cfg.secret).toBe("s3cr3t");
  });

  it("honors a custom basePath", () => {
    const cfg = createAuthConfig({
      providers: {
        google: { clientId: "id2", clientSecret: "secret2" },
      },
      basePath: "/auth",
      // @ts-expect-error
      prismaClient: h.prismaClient,
      secret: "secret-2",
    });

    expect(cfg.basePath).toBe("/auth");
  });
});
