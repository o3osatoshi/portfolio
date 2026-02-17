import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const PrismaAdapterMock = vi.fn((client: unknown) => ({
    client,
    tag: "adapter",
  }));
  const prisma = { _tag: "prisma" } as const;
  return { prisma, PrismaAdapterMock };
});

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: h.PrismaAdapterMock }));

import { createAuthConfig, getAuthUserId } from "./index";

describe("hono-auth/createAuthConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds config with OIDC provider and secret", () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
      secret: "s3cr3t",
    });

    expect(cfg.secret).toBe("s3cr3t");
    // default basePath
    expect(cfg.basePath).toBe("/api/auth");
    expect(Array.isArray(cfg.providers)).toBe(true);
    expect(cfg.providers?.[0]).toMatchObject({
      id: "oidc",
      allowDangerousEmailAccountLinking: false,
      issuer: "https://example.auth0.com/",
      type: "oidc",
    });
  });

  it("rejects OIDC profile when sub claim is missing", () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
      secret: "s3cr3t",
    });

    const provider = cfg.providers?.[0] as
      | { profile?: (profile: Record<string, unknown>) => unknown }
      | undefined;
    expect(provider?.profile).toBeDefined();

    expect(() => provider?.profile?.({})).toThrowError(/sub/);
  });

  it("drops email from profile when email is not verified", () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
      secret: "s3cr3t",
    });

    const provider = cfg.providers?.[0] as
      | {
          profile?: (profile: Record<string, unknown>) => {
            email: null | string;
            id: string;
          };
        }
      | undefined;
    const user = provider?.profile?.({
      email: "ada@example.com",
      email_verified: false,
      sub: "auth0|123",
    });

    expect(user?.id).toBe("auth0|123");
    expect(user?.email).toBeNull();
  });

  it("attaches PrismaAdapter when prismaClient provided", () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
      // @ts-expect-error prisma mock does not implement full client type
      prismaClient: h.prisma,
      secret: "s",
    });

    expect(h.PrismaAdapterMock).toHaveBeenCalledWith(h.prisma);
    expect(cfg["adapter"]).toEqual({ client: h.prisma, tag: "adapter" });
  });

  it("overrides basePath and session.strategy when provided", () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
      basePath: "/auth",
      secret: "s",
      session: { strategy: "database" },
    });
    expect(cfg.basePath).toBe("/auth");
    expect(cfg.session?.strategy).toBe("database");
  });

  it("jwt callback sets token.id and session callback mirrors it to session.user.id", async () => {
    const cfg = createAuthConfig({
      providers: {
        oidc: {
          clientId: "id",
          clientSecret: "secret",
          issuer: "https://example.auth0.com/",
        },
      },
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

describe("hono-auth/getAuthUserId", () => {
  it("returns session.user.id when available", () => {
    const userId = getAuthUserId({
      session: { expires: "2024-01-01", user: { id: "u-1" } },
    });
    expect(userId).toBe("u-1");
  });

  it("falls back to adapter user.id when session user missing", () => {
    const userId = getAuthUserId({
      session: { expires: "2024-01-01" },
      user: { id: "u-2", email: "u2@example.com", emailVerified: null },
    });
    expect(userId).toBe("u-2");
  });

  it("returns undefined when authUser missing", () => {
    expect(getAuthUserId()).toBeUndefined();
  });
});
