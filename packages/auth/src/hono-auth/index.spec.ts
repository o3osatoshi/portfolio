import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const PrismaAdapterMock = vi.fn((client: unknown) => ({
    client,
    tag: "adapter",
  }));
  const GoogleProviderMock = vi.fn((opts: unknown) => ({
    opts,
    tag: "google",
  }));
  const prisma = { _tag: "prisma" } as const;
  return { GoogleProviderMock, prisma, PrismaAdapterMock };
});

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: h.PrismaAdapterMock }));
vi.mock("@auth/core/providers/google", () => ({
  default: h.GoogleProviderMock,
}));

import { createAuthConfig } from "./index";

describe("hono-auth/createAuthConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds config with Google provider and secret", () => {
    const cfg = createAuthConfig({
      providers: {
        google: {
          clientId: "id",
          clientSecret: "secret",
        },
      },
      secret: "s3cr3t",
    });

    expect(cfg.secret).toBe("s3cr3t");
    // default basePath
    expect(cfg.basePath).toBe("/api/auth");
    // provider wired with passed credentials
    expect(h.GoogleProviderMock).toHaveBeenCalledWith({
      clientId: "id",
      clientSecret: "secret",
    });
    expect(Array.isArray(cfg.providers)).toBe(true);
    // @ts-expect-error provider mock exposes internal test-only tag
    expect(cfg.providers?.[0]?.tag).toBe("google");
  });

  it("attaches PrismaAdapter when prismaClient provided", () => {
    const cfg = createAuthConfig({
      providers: {
        google: { clientId: "id", clientSecret: "secret" },
      },
      // @ts-expect-error prisma mock does not implement full client type
      prismaClient: h.prisma,
      secret: "s",
    });

    expect(h.PrismaAdapterMock).toHaveBeenCalledWith(h.prisma);
    // The adapter instance is attached to config
    expect(cfg.adapter).toEqual({ client: h.prisma, tag: "adapter" });
  });

  it("overrides basePath and session.strategy when provided", () => {
    const cfg = createAuthConfig({
      providers: { google: { clientId: "id", clientSecret: "secret" } },
      basePath: "/auth",
      secret: "s",
      session: { strategy: "database" },
    });
    expect(cfg.basePath).toBe("/auth");
    expect(cfg.session?.strategy).toBe("database");
  });

  it("jwt callback sets token.id and session callback mirrors it to session.user.id", async () => {
    const cfg = createAuthConfig({
      providers: { google: { clientId: "id", clientSecret: "secret" } },
      secret: "s",
    });

    // jwt: set token.id when user present
    const token: Record<string, unknown> = {};
    const user = { id: "u-1" };
    // @ts-expect-error
    const outToken = await cfg.callbacks?.jwt({ token, user });
    // @ts-expect-error
    expect(outToken["id"]).toBe("u-1");

    // session: copy id from token to session.user.id
    const session = { user: {} };
    // @ts-expect-error
    const outSession = await cfg.callbacks?.session({
      // @ts-expect-error
      session,
      // @ts-expect-error
      token: outToken,
    });
    expect(outSession?.user?.id).toBe("u-1");
  });
});
